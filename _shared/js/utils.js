// ── Shared JavaScript Helper Utilities for WoodTrack ──

/**
 * Format a number as Indonesian Rupiah currency (Rp)
 * @param {number} num 
 * @returns {string}
 */
window.formatRupiah = function(num) {
    if (isNaN(num)) return 'Rp 0';
    return 'Rp ' + Number(num).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

/**
 * Format a number with localized thousands separators and custom decimals
 * @param {number} num 
 * @param {number} decimals 
 * @returns {string}
 */
window.formatNumber = function(num, decimals = 0) {
    if (isNaN(num)) return '0';
    return Number(num).toLocaleString('id-ID', { 
        minimumFractionDigits: decimals, 
        maximumFractionDigits: decimals 
    });
};

/**
 * Format volume numbers as m³ (cubic meters)
 * @param {number} vol 
 * @param {number} decimals 
 * @returns {string}
 */
window.formatVolume = function(vol, decimals = 4) {
    if (isNaN(vol)) return '0,0000 m³';
    return window.formatNumber(vol, decimals) + ' m³';
};

/**
 * Helper to generate a dummy placeholder image URL
 * @param {number} w - Width
 * @param {number} h - Height
 * @param {string} text - Label text on image
 * @param {string} bgHex - Background color hex (without #)
 * @param {string} fgHex - Foreground color hex (without #)
 * @returns {string}
 */
window.getPlaceholderImage = function(w, h, text = '', bgHex = 'F0EDE8', fgHex = '78350F') {
    let url = `https://dummyimage.com/${w}x${h}/${bgHex}/${fgHex}`;
    if (text) {
        url += `&text=${encodeURIComponent(text)}`;
    }
    return url;
};

// ── Shared Stock Calculation Engines ──

window.calculateLogsStock = function() {
    const rawLogs = JSON.parse(localStorage.getItem('woodtrack_penerimaan_log') || '[]');
    const conversions = JSON.parse(localStorage.getItem('woodtrack_log_conversions') || '[]');
    const sizeCoefs = { 'A1': 0.08, 'A2': 0.18, 'A3': 0.38, 'A4': 0.68, 'A5': 1.18 };
    const logMap = {};

    rawLogs.forEach(receipt => {
        if (receipt.items) {
            receipt.items.forEach(item => {
                const key = `${item.jenis}|${item.grade}|${item.size}`;
                if (!logMap[key]) {
                    logMap[key] = { jenis: item.jenis, grade: item.grade, size: item.size, received: 0, consumed: 0 };
                }
                logMap[key].received += parseInt(item.jumlah) || 0;
            });
        }
    });

    conversions.forEach(conv => {
        if (conv.input) {
            const key = `${conv.input.jenis}|${conv.input.grade}|${conv.input.size}`;
            if (!logMap[key]) {
                logMap[key] = { jenis: conv.input.jenis, grade: conv.input.grade, size: conv.input.size, received: 0, consumed: 0 };
            }
            logMap[key].consumed += parseInt(conv.input.jumlah) || 0;
        }
    });

    return Object.values(logMap).map(log => {
        const stockLeft = Math.max(0, log.received - log.consumed);
        const coef = sizeCoefs[log.size] || 0.1;
        const volume = stockLeft * coef;
        return { ...log, stock: stockLeft, volume: volume };
    }).filter(log => log.stock > 0 || log.received > 0);
};

window.calculateSawtimberStock = function() {
    const rawSawtimber = JSON.parse(localStorage.getItem('woodtrack_penerimaan_sawtimber') || '[]');
    const ovenBatches = JSON.parse(localStorage.getItem('woodtrack_konversi_kiln_dry') || '[]');
    const defaultSizes = [
        { code: '5×10×200', volume: 0.0100 },
        { code: '5×15×200', volume: 0.0150 },
        { code: '7×15×400', volume: 0.0420 },
        { code: '3×7×300', volume: 0.0063 },
        { code: '4×10×400', volume: 0.0160 }
    ];
    const savedSizes = JSON.parse(localStorage.getItem('woodtrack_sawtimber_sizes') || '[]');
    const allSizes = [...savedSizes, ...defaultSizes];
    const stockMap = {};

    rawSawtimber.forEach(entry => {
        if (entry.items) {
            entry.items.forEach(item => {
                const key = `${item.jenis}|${item.grade}|${item.size}`;
                if (!stockMap[key]) {
                    stockMap[key] = { jenis: item.jenis, grade: item.grade, size: item.size, received: 0, consumed: 0 };
                }
                stockMap[key].received += parseInt(item.jumlah) || 0;
            });
        }
    });

    ovenBatches.forEach(batch => {
        if (batch.input) {
            const key = `${batch.input.jenis}|${batch.input.grade}|${batch.input.size}`;
            if (!stockMap[key]) {
                stockMap[key] = { jenis: batch.input.jenis, grade: batch.input.grade, size: batch.input.size, received: 0, consumed: 0 };
            }
            stockMap[key].consumed += parseInt(batch.input.jumlah) || 0;
        }
    });

    return Object.values(stockMap).map(item => {
        const stockLeft = Math.max(0, item.received - item.consumed);
        const sDef = allSizes.find(s => s.code === item.size);
        const coef = sDef ? sDef.volume : 0.015;
        const volume = stockLeft * coef;
        return { ...item, stock: stockLeft, volume: volume };
    }).filter(item => item.stock > 0 || item.received > 0);
};

window.calculateBahanBakuStock = function() {
    const rawGlass = JSON.parse(localStorage.getItem('woodtrack_penerimaan_kaca') || '[]');
    const dryKiln = JSON.parse(localStorage.getItem('woodtrack_konversi_kiln_dry') || '[]');
    const prodRequests = JSON.parse(localStorage.getItem('woodtrack_produksi_requests') || '[]');
    const stockMap = {};

    // Kaca incoming
    rawGlass.forEach(entry => {
        if (entry.items) {
            entry.items.forEach(item => {
                const spec = `${item.tipe} ${item.tebal}mm - ${item.dimensi}`;
                if (!stockMap[spec]) {
                    stockMap[spec] = { spec: spec, kategori: 'Kaca', received: 0, consumed: 0 };
                }
                stockMap[spec].received += parseInt(item.jumlah) || 0;
            });
        }
    });

    // Papan Kering KD incoming
    dryKiln.forEach(batch => {
        if (batch.output) {
            const spec = `${batch.output.jenis} - ${batch.output.size} - Grade ${batch.output.grade}`;
            if (!stockMap[spec]) {
                stockMap[spec] = { spec: spec, kategori: 'Papan Kering', received: 0, consumed: 0 };
            }
            stockMap[spec].received += parseInt(batch.output.jumlah) || 0;
        }
    });

    // Production consumptions
    prodRequests.forEach(req => {
        if (req.materials) {
            req.materials.forEach(mat => {
                if (mat.kategori === 'Kaca' || mat.kategori === 'Sawtimber') {
                    const spec = mat.spec;
                    if (!stockMap[spec]) {
                        stockMap[spec] = { spec: spec, kategori: mat.kategori === 'Kaca' ? 'Kaca' : 'Papan Kering', received: 0, consumed: 0 };
                    }
                    stockMap[spec].consumed += parseInt(mat.jumlah) || 0;
                }
            });
        }
    });

    return Object.values(stockMap).map(item => {
        const stockLeft = Math.max(0, item.received - item.consumed);
        return { ...item, stock: stockLeft };
    }).filter(item => item.stock > 0 || item.received > 0);
};

window.calculateCrosscutStock = function() {
    const rawCrosscut = JSON.parse(localStorage.getItem('woodtrack_penerimaan_crosscut') || '[]');
    const prodRequests = JSON.parse(localStorage.getItem('woodtrack_produksi_requests') || '[]');
    const stockMap = {};

    rawCrosscut.forEach(entry => {
        if (entry.items) {
            entry.items.forEach(item => {
                const key = item.sumber.trim();
                if (!stockMap[key]) {
                    stockMap[key] = { spec: key, kategori: 'Crosscut', received: 0, consumed: 0 };
                }
                stockMap[key].received += parseFloat(item.volume) || 0;
            });
        }
    });

    prodRequests.forEach(req => {
        if (req.materials) {
            req.materials.forEach(mat => {
                if (mat.kategori === 'Crosscut') {
                    const key = mat.spec.trim();
                    if (!stockMap[key]) {
                        stockMap[key] = { spec: key, kategori: 'Crosscut', received: 0, consumed: 0 };
                    }
                    stockMap[key].consumed += parseFloat(mat.jumlah) || 0;
                }
            });
        }
    });

    return Object.values(stockMap).map(item => {
        const stockLeft = Math.max(0, item.received - item.consumed);
        return { ...item, stock: stockLeft, sumber: item.spec };
    }).filter(item => item.stock > 0 || item.received > 0);
};

window.calculateProductsStock = function() {
    const prodLogs = JSON.parse(localStorage.getItem('woodtrack_hasil_produksi_logs') || '[]');
    const salesLogs = JSON.parse(localStorage.getItem('woodtrack_penjualan_produk') || '[]');
    const stockMap = {};

    prodLogs.forEach(entry => {
        const key = `${entry.nama}|${entry.grade}`;
        if (!stockMap[key]) {
            stockMap[key] = { nama: entry.nama, grade: entry.grade, received: 0, consumed: 0 };
        }
        stockMap[key].received += parseInt(entry.jumlah) || 0;
    });

    salesLogs.forEach(sale => {
        if (sale.items) {
            sale.items.forEach(item => {
                const key = `${item.nama}|${item.grade}`;
                if (!stockMap[key]) {
                    stockMap[key] = { nama: item.nama, grade: item.grade, received: 0, consumed: 0 };
                }
                stockMap[key].consumed += parseInt(item.jumlah) || 0;
            });
        }
    });

    return Object.values(stockMap).map(item => {
        const stockLeft = Math.max(0, item.received - item.consumed);
        return { ...item, stock: stockLeft };
    }).filter(item => item.stock > 0 || item.received > 0);
};

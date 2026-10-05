function withTimeout(operation, milliseconds = 10000) {
    let timer;
    return Promise.race([
        operation,
        new Promise((_, reject) => {
            timer = setTimeout(() => reject(Object.assign(new Error('Firebase temporariamente indisponível. Verifique a configuração do servidor.'), { status: 503 })), milliseconds);
        }),
    ]).finally(() => clearTimeout(timer));
}

module.exports = { withTimeout };

// Gera as fotos otimizadas dos cursos (640 px e 1200 px, WebP) a partir das
// originais em public/imagem/proficao. Uso: node scripts/fotos-cursos.cjs
const sharp = require('sharp');
const path = require('path');

const origem = path.join(__dirname, '..', 'public', 'imagem', 'proficao');
const destino = path.join(__dirname, '..', 'public', 'imagem', 'cursos');
const fotos = {
    gastronomia: 'proficao.png',
    veiculos: 'proficao2.png',
    eletrica: 'proficao3.png',
    beleza: 'proficao4.png',
    saude: 'enfermagem.png',
    administracao: 'administracao.jpg',
    confeccao: 'confeccao.jpg',
};

(async () => {
    for (const [nome, arquivo] of Object.entries(fotos)) {
        for (const largura of [640, 1200]) {
            await sharp(path.join(origem, arquivo))
                .resize({ width: largura, withoutEnlargement: true })
                .webp({ quality: 72 })
                .toFile(path.join(destino, `${nome}-${largura}.webp`));
        }
    }
})();

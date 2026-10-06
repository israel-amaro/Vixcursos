const { createLocalState } = require('./local-db');

async function importExistingCourses(db) {
    const examples = createLocalState().cursos;
    const mascotIds = ['beleza', 'moda', 'chef', 'tecnologia', 'saude'];
    return db.mutate(state => {
        const result = { imported: 0, existing: 0 };
        for (const [index, course] of examples.entries()) {
            const source = `catalogo-inicial-${course.id}`;
            const exists = state.cursos.some(row => row.origem_catalogo === source ||
                (row.curso_id === course.curso_id && row.local_id === course.local_id && row.data_inicio === course.data_inicio));
            if (exists) { result.existing++; continue; }
            const id = Math.max(0, ...state.cursos.map(row => Number(row.id) || 0)) + 1;
            state.cursos.push({ ...course, id, mascote_id: mascotIds[index], origem_catalogo: source });
            result.imported++;
        }
        return result;
    });
}

module.exports = { importExistingCourses };

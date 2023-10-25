const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function updateShelldue(shelldue){
    return await db.shelldue.update({
        where:{
            id: shelldue.id
        },
        data: shelldue
    })
}

module.exports = {
    updateShelldue
}
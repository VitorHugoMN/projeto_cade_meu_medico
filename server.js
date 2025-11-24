import "dotenv/config";
import express from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
app.use(express.json());

const prisma = new PrismaClient();

// ------------------------------- MÉDICOS -------------------------------

app.post("/medicos", async (req, res) => {
  try {
    const { nome, crm, telefone, email, biografia, especialidades } = req.body;

    const existe = await prisma.medico.findUnique({
      where: { crm }
    });

    if (existe) {
      return res.status(400).json({ error: "CRM já cadastrado" });
    }

    const medico = await prisma.medico.create({
      data: {
        nome,
        crm,
        telefone,
        email,
        biografia,
        especialidades
      }
    });

    return res.status(201).json(medico);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Erro ao criar médico" });
  }
});


app.get("/medicos", async (req, res) => {
  try {
    const { nome, especialidade } = req.query;

    const medicos = await prisma.medico.findMany({
      where: {
        AND: [
          nome ? { nome: { contains: nome, mode: "insensitive" } } : {},
          especialidade ? { especialidades: { has: especialidade } } : {}
        ]
      }
    });

    return res.status(200).json(medicos);

  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar médicos" });
  }
});



app.delete("/medicos/:crm", async (req, res) => {
  try {
    const { crm } = req.params;

    const medico = await prisma.medico.findUnique({ where: { crm } });

    if (!medico) {
      return res.status(404).json({ error: "Médico não encontrado" });
    }

    await prisma.medico.delete({ where: { crm } });

    return res.status(200).json({ mensagem: "Médico deletado com sucesso" });

  } catch (error) {
    return res.status(500).json({ error: "Erro ao deletar médico" });
  }
});

app.put("/medicos/:crm", async (req, res) => {
  try {
    const { crm } = req.params;
    const { nome, telefone, email, biografia, especialidades } = req.body;

    const medico = await prisma.medico.update({
      where: { crm },
      data: {
        nome,
        telefone,
        email,
        biografia,
        especialidades
      }
    });

    res.status(200).json(medico);

  } catch (error) {
    if(error.code === 'P2025') {
      return res.status(404).json({error:'Médico não encontrado'})
    }
    return res.status(500).json({error:'Erro ao atualizar médico'})
  }
});

// ------------------------------- ESPECIALIDADES -------------------------------

app.post("/especialidades", async (req, res) => {
  try {
    const especialidade = await prisma.especialidade.create({
      data: { nome: req.body.nome }
    });

    res.status(201).json(especialidade);

  } catch (error) {
    res.status(500).json({ erro:'Erro ao criar especialidade' });
  }
});


app.get("/especialidades", async (req, res) => {
  try {
    const especialidades = await prisma.especialidade.findMany();
    return res.status(200).json(especialidades);

  } catch (error) {
    return res.status(400).json({ error: "Erro ao procurar especialidades" });
  }
});


// ------------------------------- Usuarios -------------------------------

app.post('/usuarios', async(req, res) =>{
  try {
    const {email, senha} = req.body;
    const usuario = await prisma.usuario.create({
      data: {
        email,
        senha
      }
    })
    res.status(201).json(usuario);
  } catch (error) {
    res.status(500).json({error:'Erro ao criar usuario'});
  }
})

app.get('/usuarios', async (req, res) => {
  try {
    const usuario = await prisma.usuario.findMany();
    res.status(200).json(usuario);

  } catch (error) {
      return res.status(500).json({error:'Erro ao buscar usuario'})
  }
  }
)


app.delete('/usuarios/:id', async(req, res) =>{
  try {
    const {id} = req.params;

    const usuario = await prisma.usuario.delete({
      where: {id : String(id)}
    })
    res.status(200).json({message:'Usuario deletado'});

  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({error:'Usuário não existe' })
    }
    res.status(500).json({error:'Erro ao deletar usuario'});
  }
})

app.put('/usuarios/:id', async(req, res) =>{
  try {
    const {id} = req.params;
    const {email, senha} = req.body;

    const usuario = await prisma.usuario.update({
      where: {id: String(id)},
      data: {
        email,
        senha
      }
    })

    res.status(200).json(usuario);

  } catch (error) {
     if (error.code === 'P2025') {
      return res.status(404).json({message:'Usuário não encontrado'})
    }
    return res.status(500).json({error:'Erro ao atualizar usuario'});
  }
})


app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});

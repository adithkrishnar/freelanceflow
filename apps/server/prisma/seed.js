import { PrismaClient } from "../src/generated/prisma/client.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {

    const password = await bcrypt.hash("123456",10);

    const user = await prisma.user.upsert({

        where:{
            email:"demo@freelanceflow.com"
        },

        update:{},

        create:{
            name:"Demo User",
            email:"demo@freelanceflow.com",
            password,
            plan:"PRO"
        }

    });

    const client = await prisma.client.create({

        data:{
            name:"NorthStar Digital",
            email:"client@test.com",
            company:"NorthStar",
            defaultHourlyRate:1500,
            userId:user.id
        }

    });

    const project = await prisma.project.create({

        data:{
            name:"SaaS Dashboard",
            description:"Sample project",
            budget:75000,
            status:"ACTIVE",
            clientId:client.id,
            userId:user.id
        }

    });

    await prisma.task.create({

        data:{
            title:"Design Dashboard",
            description:"Finish dashboard",
            status:"TODO",
            dueDate:new Date(),
            projectId:project.id,
            userId:user.id
        }

    });

    console.log("Database seeded");
}

main()
.catch(console.error)
.finally(async()=>{

await prisma.$disconnect();

});
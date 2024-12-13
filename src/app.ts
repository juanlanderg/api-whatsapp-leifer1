import { createBot, createFlow, MemoryDB, createProvider, addKeyword } from "@bot-whatsapp/bot";
import { BaileysProvider, handleCtx } from "@bot-whatsapp/provider-baileys";
import cors from "cors";

// Flujo de bienvenida
const flowBienvenida = addKeyword("camacho").addAnswer("Buenas, bienvenido!");

const main = async () => {
    // Configuración del proveedor de Baileys
    const provider = createProvider(BaileysProvider);

    // Iniciar el servidor HTTP en el puerto 3002
    provider.initHttpServer(3002);

    // Configuración de CORS
    const allowedOrigins = process.env.NODE_ENV === "production"
        ? ["https://hojaldrados-app.flutterflow.app/"] // Dominio de tu app en producción
        : ["http://localhost:3002"];           // Dominio en desarrollo

    provider.http?.server.use(cors({
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
    }));

    // Definir el endpoint para enviar mensajes
    provider.http?.server.post("/send-message", handleCtx(async (bot, req, res) => {
        const { phone, message, mediaUrl } = req.body;

        // Validación de campos obligatorios
        if (!phone || !message) {
            return res.status(400).end("Número de teléfono y mensaje son requeridos.");
        }

        // Validación del formato del número de teléfono
        if (phone.length !== 12 || !phone.startsWith("584")) {
            return res.status(400).end("El número de teléfono debe tener 12 caracteres y comenzar con 584.");
        }

        try {
            // Enviar el mensaje
            await bot.sendMessage(phone, message, mediaUrl && { media: mediaUrl });
            res.end("Mensaje enviado correctamente.");
        } catch (error) {
            console.error("Error al enviar el mensaje:", error);
            res.status(500).end("Error al enviar el mensaje.");
        }
    }));

    // Manejo de errores
    process.on("uncaughtException", (error) => {
        console.error("Error no controlado:", error);
    });

    process.on("unhandledRejection", (reason, promise) => {
        console.error("Rechazo no manejado en la promesa:", promise, "razón:", reason);
    });

    // Crear el bot con el flujo de bienvenida
    await createBot({
        flow: createFlow([flowBienvenida]),
        database: new MemoryDB(),
        provider,
    });
};

// Llamar a la función principal
main();
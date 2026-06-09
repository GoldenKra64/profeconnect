const prisma = require("./prisma");

const tools = [
    {
        type: "function",
        function: {
            name: "buscar_posts",
            description: "Busca publicaciones relacionadas con un tema",
            parameters: {
                type: "object",
                properties: {
                    termino: {
                        type: "string",
                        description: "Tema a buscar"
                    }
                },
                required: ["termino"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "obtener_posts",
            description: "Obtiene los ultimos 10 posts",
            parameters: {
                type: "object",
                properties: {
                    titulo: {
                        type: "string"
                    }
                }
            }
        }
    },
    {
        type: "function",
        function: {
            name: "search_web",
            description: "Busca en la web",
            parameters: {
                type: "object",
                properties: {
                    url: {
                        type: "string",
                        description: "URL de la página a buscar"
                    }
                },
                required: ["url"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "read_pdf",
            description: "Lee un PDF",
            parameters: {
                type: "object",
                properties: {
                    path: {
                        type: "string",
                        description: "Path del PDF"
                    }
                },
                required: ["path"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "describe_image",
            description: "Describe una imagen",
            parameters: {
                type: "object",
                properties: {
                    path: {
                        type: "string",
                        description: "Path de la imagen"
                    }
                },
                required: ["path"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "summarize_text",
            description: "Resume un texto",
            parameters: {
                type: "object",
                properties: {
                    text: {
                        type: "string",
                        description: "Texto a resumir"
                    }
                },
                required: ["text"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "translate_text",
            description: "Traduce un texto",
            parameters: {
                type: "object",
                properties: {
                    text: {
                        type: "string",
                        description: "Texto a traducir"
                    },
                    language: {
                        type: "string",
                        description: "Idioma de destino"
                    }
                },
                required: ["text", "language"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "summarize_pdf",
            description: "Resume un PDF",
            parameters: {
                type: "object",
                properties: {
                    path: {
                        type: "string",
                        description: "Path del PDF"
                    }
                },
                required: ["path"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "summarize_excel",
            description: "Resume un Excel",
            parameters: {
                type: "object",
                properties: {
                    path: {
                        type: "string",
                        description: "Path del Excel"
                    }
                },
                required: ["path"]
            }
        }
    }
];

async function executeTool(toolCall) {
    const args = JSON.parse(toolCall.function.arguments);

    switch (toolCall.function.name) {
        case "buscar_posts":
            return await prisma.post.findMany({
                where: {
                    status: "PUBLISHED",
                    OR: [
                        {
                            title: {
                                contains: args.termino,
                                mode: "insensitive"
                            }
                        },
                        {
                            content: {
                                contains: args.termino,
                                mode: "insensitive"
                            }
                        },
                        {
                            tags: {
                                some: {
                                    name: {
                                        contains: args.termino,
                                        mode: "insensitive"
                                    }
                                }
                            }
                        }
                    ]
                },
                include: {
                    author: true,
                    tags: true,
                    attachments: true,
                    comments: true,
                    reports: true,
                    reactions: true,
                    securityIncidents: true
                },
                take: 10
            });

        case "obtener_posts":
            return await prisma.post.findMany({
                where: {
                    status: "PUBLISHED"
                },
                include: {
                    author: true,
                    tags: true,
                    attachments: true,
                    comments: true,
                    reports: true,
                    reactions: true,
                    securityIncidents: true
                },
                take: 10
            });
        case "search_web":
            const axios = require("axios");
            const response = await axios.get(args.url);
            return response.data;
            break;
        
        case "read_pdf":
            const pdfreader = require("pdfreader");
            const pdfData = await pdfreader.load(args.path);
            return pdfData;
            break;

        case "describe_image":
            const imageSize = require("image-size");
            const size = imageSize(args.path);
            return size;
            break;

        case "summarize_text":
            const mammoth = require("mammoth");
            const text = await mammoth.extractRawText(args.text);
            return text;
            break;

        case "translate_text":
            const openai = require("openai");
            const { data } = await openai.Chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "user",
                        content: `Translate the following text from ${args.language} to English: ${args.text}`
                    }
                ]
            });
            return data.choices[0].message.content;
            break;

        case "summarize_pdf":
            const pdfparse = require("pdf-parse");
            const pdf = await pdfparse(args.path);
            return pdf;
            break;

        case "summarize_excel":
            const xlsx = require("xlsx");
            const workbook = xlsx.readFile(args.path);
            return workbook;
            break;

        default:
            throw new Error("Tool no implementada");
    }
}

module.exports = {
    executeTool,
    tools
}
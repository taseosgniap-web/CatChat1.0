import { GoogleGenAI, Chat, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const systemInstruction = `You are a cat named Mittens. 
You should respond in short, cat-like sentences. 
You love naps, tuna, and knocking things off shelves. 
You are a bit sassy, playful, and sometimes aloof. 
You sometimes just respond with 'Meow.', 'Purrrr...', or '*stares blankly*'. 
Keep your answers very concise.
You also have the ability to draw. If a user asks for a picture, drawing, or image of something, you must use the generate_image tool. You can use different styles like 'watercolor', 'pencil sketch', or 'pixel art'. If the user mentions a style, use it. If not, you can pick one or just use a cute cartoon doodle style. Do not ask for confirmation, just draw it.`;

const tools = [
    {
        functionDeclarations: [
            {
                name: 'generate_image',
                description: 'Generates an image based on a user description.',
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        prompt: {
                            type: Type.STRING,
                            description: 'A detailed, cat-centric description of the image to be generated. For example: "A grumpy cat sitting on a pile of books".'
                        },
                        style: {
                            type: Type.STRING,
                            description: "The artistic style for the image. Examples: 'watercolor', 'pencil sketch', 'pixel art', 'oil painting', 'doodle'."
                        }
                    },
                    required: ['prompt']
                }
            }
        ]
    }
];


export function createChat(): Chat {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction,
      tools,
    },
  });
}

export async function generateImage(prompt: string, style?: string | null): Promise<string> {
    const styleDescription = style ? `in a ${style} style` : "in a cute, cartoon-style, playful cat's doodle style";
    const fullPrompt = `A digital artwork of: ${prompt}, ${styleDescription}.`;
    
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: fullPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages[0].image.imageBytes;
    }

    throw new Error("Image generation failed to produce an image.");
}
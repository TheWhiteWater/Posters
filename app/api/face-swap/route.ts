import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

const TEMPLATES = [
    {
        id: 1,
        name: "Wanted Poster",
        price: 9.99,
        targetImage: `${BASE_URL}/templates/wanted.jpg`
    },
    {
        id: 2,
        name: "Mona Lisa",
        price: 14.99,
        targetImage: `${BASE_URL}/templates/mona-lisa.jpg`
    },
    {
        id: 3,
        name: "Mugshot",
        price: 4.99,
        targetImage: `${BASE_URL}/templates/mugshot.jpg`
    }
];

export async function POST(req: Request) {
    try {
        if (!process.env.REPLICATE_API_TOKEN) {
            throw new Error('REPLICATE_API_TOKEN is not configured');
        }

        const formData = await req.formData();
        const sourceImage = formData.get('sourceImage') as File;
        const templateId = formData.get('templateId') as string;

        console.log('Request received:', {
            sourceImageType: sourceImage?.type,
            sourceImageSize: sourceImage?.size,
            templateId
        });

        if (!sourceImage || !templateId) {
            return NextResponse.json(
                { error: 'Source image and template ID are required' },
                { status: 400 }
            );
        }

        // Находим шаблон
        const template = TEMPLATES.find(t => t.id === parseInt(templateId));
        if (!template) {
            return NextResponse.json(
                { error: 'Template not found' },
                { status: 404 }
            );
        }

        // Проверяем размер файла
        if (sourceImage.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File size should not exceed 5MB' },
                { status: 400 }
            );
        }

        // Конвертируем File в base64
        const sourceBuffer = await sourceImage.arrayBuffer();
        const sourceBase64 = Buffer.from(sourceBuffer).toString('base64');
        const sourceDataUrl = `data:${sourceImage.type};base64,${sourceBase64}`;

        console.log('Making request to Replicate API with template:', template.targetImage);

        // Создаем запрос к Replicate API
        const response = await fetch('https://api.replicate.com/v1/predictions', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
// Читаем файл шаблона
            const templatePath = path.join(process.cwd(), 'public', template.targetImage);
            const templateBuffer = await fs.promises.readFile(templatePath);
            const templateBase64 = Buffer.from(templateBuffer).toString('base64');
            const templateDataUrl = `data:image/jpeg;base64,${templateBase64}`;

            body: JSON.stringify({
                version: "cff87316e31787df12002c9e20a78a017a36cb31fde9862d8dedd15ab29b7288",
                input: {
                    local_source: sourceDataUrl,
                    local_target: templateDataUrl, // <- используем base64 данные
                    weight: 0.5,
                    cache_days: 10,
                    det_thresh: 0.1,
                }
            })

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to create prediction');
        }

        const prediction = await response.json();
        console.log('Prediction created:', prediction);

        // Ждем результат
        let result = prediction;
        let attempts = 0;
        const maxAttempts = 30; // 30 секунд максимум

        while (
            attempts < maxAttempts &&
            result.status !== 'succeeded' &&
            result.status !== 'failed'
            ) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const pollResponse = await fetch(
                `https://api.replicate.com/v1/predictions/${prediction.id}`,
                {
                    headers: {
                        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
                    }
                }
            );

            if (!pollResponse.ok) {
                throw new Error('Failed to check prediction status');
            }

            result = await pollResponse.json();
            console.log('Polling status:', result.status);
            attempts++;
        }

        if (result.status === 'failed') {
            throw new Error(result.error || 'Processing failed');
        }

        if (attempts >= maxAttempts) {
            throw new Error('Processing timeout');
        }

        console.log('Final result:', result);

        return NextResponse.json({
            success: true,
            result,
            template: {
                id: template.id,
                name: template.name
            }
        });

    } catch (error) {
        console.error('Face swap error:', error);
        return NextResponse.json(
            {
                error: 'Failed to process image',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
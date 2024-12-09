import { NextResponse } from 'next/server';
import Replicate from 'replicate';
import { TEMPLATES } from '../../config/templates';

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
      throw new Error('Source image and template ID are required');
    }

    // Находим шаблон
    const template = TEMPLATES.find(t => t.id === parseInt(templateId));
    if (!template) {
      throw new Error('Template not found');
    }

    // Получаем полный URL шаблона
    const templateUrl = new URL(template.targetImage, process.env.NEXT_PUBLIC_BASE_URL).toString();

    // Конвертируем File в base64
    const sourceBuffer = await sourceImage.arrayBuffer();
    const sourceBase64 = Buffer.from(sourceBuffer).toString('base64');
    const sourceDataUrl = `data:${sourceImage.type};base64,${sourceBase64}`;

    // Создаем запрос к Replicate API напрямую
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "cff87316e31787df12002c9e20a78a017a36cb31fde9862d8dedd15ab29b7288",
        input: {
          local_source: sourceDataUrl,
          local_target: templateUrl,
          weight: 0.5,
          cache_days: 10,
          det_thresh: 0.1,
        }
      })
    });

    const prediction = await response.json();
    console.log('Prediction created:', prediction);

    if (prediction.error) {
      throw new Error(prediction.error);
    }

    // Ждем результат
    let result = prediction;
    while (result.status !== 'succeeded' && result.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1 second
      const pollResponse = await fetch(prediction.urls.get, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        }
      });
      result = await pollResponse.json();
      console.log('Prediction status:', result.status);
    }

    if (result.status === 'failed') {
      throw new Error(result.error);
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
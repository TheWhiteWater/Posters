import Replicate from 'replicate';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Тестовые URL изображений
    const input = {
      local_source: "https://replicate.delivery/pbxt/KgRH3TXuSLGMGuRicUX9pKchG17Nk6qbJMzv6s0NvTj2nD7P/src.jpg",
      local_target: "https://replicate.delivery/pbxt/KgRH4AoijNe7h1lU84m4YwghJNdZ520I7qhGe0ip1ufa9CSA/tgt.jpg"
    };

    const prediction = await replicate.run(
      "xiankgx/face-swap:cff87316e31787df12002c9e20a78a017a36cb31fde9862d8dedd15ab29b7288",
      { input }
    );

    return NextResponse.json({ 
      status: 'success',
      message: 'Model test successful',
      result: prediction
    });
    
  } catch (error) {
    console.error('API test error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to connect to Replicate API',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
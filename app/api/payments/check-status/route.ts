import { NextRequest, NextResponse } from 'next/server';
import { paystackRequest } from '@/lib/paystack';
import type { ChargeResponse } from '@/lib/paystack-types';

export async function GET(request: NextRequest) {
  // Ensure reference is available to both try and catch
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get('reference');

  if (!reference) {
    return NextResponse.json(
      { error: 'Reference is required' },
      { status: 400 }
    );
  }

  try {
    // Use transaction verify endpoint for completed/in-progress transactions
    const response = await paystackRequest<any>(
      `/transaction/verify/${reference}`,
      'GET'
    );

    // Map Paystack statuses to our ChargeStatus
    // Paystack data.status can be: 'success', 'failed', 'ongoing', 'abandoned', etc.
    const mapStatus = (status: string): 'success' | 'failed' | 'pending' => {
      if (status === 'success') return 'success';
      if (status === 'failed') return 'failed';
      // treat 'ongoing'/'abandoned'/others as pending
      return 'pending';
    };

    // Transform Paystack transaction response to our ChargeResponse format
    const transformedResponse: ChargeResponse = {
      status: response.status,
      message: response.message,
      data: {
        status: mapStatus(response.data?.status),
        reference: response.data?.reference ?? reference,
        amount: response.data?.amount ?? 0,
        authorization: response.data?.authorization,
        gateway_response: response.data?.gateway_response,
        message: response.data?.message,
      },
    };

    return NextResponse.json(transformedResponse);
  } catch (error: any) {
    // If transaction not found or verify throws, return pending instead of error
    return NextResponse.json({
      status: true,
      message: 'Transaction is being processed',
      data: {
        status: 'pending',
        reference,
        amount: 0,
      },
    });
  }
}
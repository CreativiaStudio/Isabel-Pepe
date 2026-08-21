import { NextResponse } from 'next/server';
import { runCertificateVerification } from '@/scripts/verify_certificates_e2e';

export async function GET() {
  try {
    const result = await runCertificateVerification();
    return NextResponse.json({
      success: result.passed,
      data: result
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown verification error'
    }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { runCertificateVerification } from '@/scripts/verify_certificates_e2e';
import { verifyAdminAuth } from '@/lib/auth-guard';

export async function GET(req: Request) {
  const auth = await verifyAdminAuth(req);
  if (!auth.authorized) return auth.response;

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

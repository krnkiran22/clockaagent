import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import dbConnect from '@/lib/mongoose';
import Vendor from '@/models/Vendor';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    
    // In production, insert valid gateway check
    const vendor = await Vendor.create(body);
    
    return NextResponse.json({ success: true, data: vendor }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const vendors = await Vendor.find({});
    return NextResponse.json({ success: true, count: vendors.length, data: vendors }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

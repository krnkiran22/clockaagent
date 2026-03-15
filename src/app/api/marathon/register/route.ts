import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Registration from '@/models/Registration';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await dbConnect();
    
    // Simulate deposit confirmation delay via x402
    body.hasMadeDeposit = true;
    
    const registration = await Registration.create(body);
    
    // Total currently registered
    const totalRegistrations = await Registration.countDocuments();
    
    return NextResponse.json({ 
      success: true, 
      data: registration,
      totalRegistrations 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    // Fetch top registrants by score
    const registrations = await Registration.find({}).sort({ commitmentScore: -1 });
    return NextResponse.json({ success: true, count: registrations.length, data: registrations }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

import {connect} from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";


connect();

export async function POST(request: NextRequest) {
  try {
    console.log("POST handler started");
    const reqBody = await request.json();
    console.log("Request body:", reqBody);
    const { email, password } = reqBody;
    console.log(reqBody);

    //check if user exists
    const user = await User.findOne({ email });
    console.log(user);
    //if user does not exist
    if (!user) {
        console.log("User does not exist");
      return NextResponse.json({ error: "User does not exist" }, { status: 400 });
    }
    //check if user is verified
    if (!user.isVerfied) {
      return NextResponse.json({ error: "Email not verified" }, { status: 401 });
    }

    //check if password is correct
    const isMatch = await bcryptjs.compare(password, user.password);
    console.log(isMatch);
    if (!isMatch) {
        console.log("Invalid password");
      return NextResponse.json({ error: "Invalid password" }, { status: 400 });
    }

    //create token data
    const tokenData = {
      id: user._id,
      username: user.username,
      email: user.email,
    };
    //create token
    const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET!, { expiresIn: "1d" });
    console.log(token);
    //create response
    const response = NextResponse.json({
      message: "Login successful",
      success: true,
    });
    //set token in cookies
    console.log("Setting token in cookies");
    console.log(response.cookies);
    response.cookies.set("token", token, {
      httpOnly: true,
    });
    return response;
}
    catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
// services/authService.ts
import { supabase } from '@/services/supabaseClient';
import bcrypt from 'bcryptjs';
import { createJWT, verifyJWT } from './jwt'; // Import createJWT and verifyJWT
import { NextResponse } from 'next/server';

export const loginUser = async (username: string, password: string) => {
  console.log("Attempting login with:", { username, password });

  // Step 1: Get user data from the 'users' table
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id, username, password")
    .eq("username", username)
    .single();

  if (userError || !userData) {
    console.log("Login failed: User not found");
    throw new Error("Invalid username or password");
  }

  // Step 2: Check if the password matches
  const isPasswordMatch = await bcrypt.compare(password, userData.password);
  if (!isPasswordMatch) {
    console.log("Login failed: Incorrect password");
    throw new Error("Invalid username or password");
  }

  // Step 3: Check user status from 'userDetails' table
  const { data: userDetails, error: userDetailsError } = await supabase
    .from("userDetails")
    .select("status")
    .eq("detailsid", userData.id)
    .single();

  if (userDetailsError || !userDetails) {
    console.log("Login failed: Unable to fetch user details");
    throw new Error("User details not found");
  }

  // Step 4: Check if the user account is approved (status is true)
  if (!userDetails.status) {
    console.log("Login failed: Account not approved");
    throw new Error("Not authenticated, please wait to approve your account");
  }

  // Step 5: Create JWT upon successful login
  const token = await createJWT({ id: userData.id, username: userData.username });
  console.log("Login successful:", { id: userData.id, username: userData.username, token });

  // Decrypt and log the token payload
  try {
    const decryptedPayload = await verifyJWT(token); // Use the verifyJWT function to get the payload
  } catch (error) {
    console.error('Failed to decrypt token:', error);
  }

  return { id: userData.id, username: userData.username, token };
};


export const decryptToken = async (token: string) => {
  if (!token) {
    throw new Error("No token provided");
  }

  try {
    // Use the correct secret for verification
    const payload = await verifyJWT(token);
    return payload;
  } catch (error: any) {
    // If the token has expired, remove it from localStorage
    if (error.message === 'Token expired') {
      console.log('Token expired, removing from localStorage');
      localStorage.removeItem('token');
    }
    console.error('Error decrypting token:', error);
    throw new Error("Failed to decrypt token");
  }
};



const generateUniqueId = async (): Promise<number> => {
  let generatedId: number;
  let isUnique: boolean = false;

  do {
    generatedId = Math.floor(10000 + Math.random() * 90000); // Generate a random ID

    // Check if the generated ID already exists in the 'users' table
    const { data: existingUser, error } = await supabase
      .from("users")
      .select("id")
      .eq("id", generatedId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is the code for no rows found
      console.error("Error checking for existing user:", error.message);
      throw new Error("Failed to generate unique ID.");
    }

    if (!existingUser) {
      isUnique = true; // ID is unique
    }
  } while (!isUnique);

  return generatedId; // At this point, generatedId is guaranteed to be unique
};


export enum Gender {
  Male = "male",
  Female = "female",
  Other = "other",
}

export const signupBuyer = async (
  username: string,
  email: string,
  password: string,
  firstName: string,
  bday: string,
  address: string,
  mobileNo: string,
  bio: string,
  instagram: string,
  facebook: string,
  twitter: string,
  portfolioLink: string,
  gender: Gender,
) => {
  console.log("Attempting signup with:", { username, email, gender });

  // Check if the username already exists
  const { data: existingUsername, error: usernameCheckError } = await supabase
    .from("users")
    .select("username")
    .eq("username", username)
    .single();

  if (existingUsername) {
    console.log("Signup failed: Username already exists");
    throw new Error("Signup failed: Username already exists.");
  }

  if (usernameCheckError && usernameCheckError.code !== "PGRST116") {
    console.log("Error checking username existence:", usernameCheckError.message);
    throw new Error("Signup failed, please try again.");
  }

  // Check if the email already exists
  const { data: existingUser, error: emailCheckError } = await supabase
    .from("users")
    .select("email")
    .eq("email", email)
    .single();

  if (existingUser) {
    console.log("Signup failed: Email already exists");
    throw new Error("Signup failed: Email already exists.");
  }

  if (emailCheckError && emailCheckError.code !== "PGRST116") {
    console.log("Error checking email existence:", emailCheckError.message);
    throw new Error("Signup failed, please try again.");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  const generatedId = await generateUniqueId();

  // Insert into users table
  const { data: userData, error: userError } = await supabase
    .from("users")
    .insert([{ id: generatedId, username, email, password: hashedPassword }])
    .select("id, username")
    .single();

  if (userError || !userData) {
    console.log("Signup failed:", userError ? userError.message : "Unknown error");
    throw new Error("Signup failed, please try again.");
  }

  console.log("User created:", { id: userData.id, username: userData.username });

  // Insert into userDetails table
  const { error: detailsError } = await supabase
    .from("userDetails")
    .insert([{
      detailsid: userData.id,
      first_name: firstName,
      bday,
      address,
      mobileNo,
      bio,
      email,
      instagram,
      facebook,
      twitter,
      portfolioLink,
      gender,
      status: false,
      role: "buyer",
    }]);

  if (detailsError) {
    console.log("Failed to insert user details:", detailsError.message);
    throw new Error("Signup failed, could not insert user details.");
  }

  console.log("User details added");

  // Create JWT
  const token = await createJWT({ id: userData.id, username: userData.username });

  return { id: userData.id, username: userData.username, token };
};




let isSubmitting = false;

export const signupUser = async (
  username: string,
  email: string,
  password: string,
  firstName: string,
  creativeField: string,
  bday: string,
  address: string,
  mobileNo: string,
  bio: string,
  instagram: string,
  facebook: string,
  twitter: string,
  portfolioLink: string,
  gender: string,
) => {
  if (isSubmitting) {
    console.log("Signup already in progress.");
    throw new Error("Please wait, submission is already in progress.");
  }

  isSubmitting = true; // Set the flag to true to prevent further submissions

  console.log("Attempting signup with:", { username, email });

  // Check if the username already exists
  const { data: existingUsername, error: usernameCheckError } = await supabase
    .from("users")
    .select("username")
    .eq("username", username)
    .single();

  if (existingUsername) {
    console.log("Signup failed: Username already exists");
    isSubmitting = false; // Reset the flag
    throw new Error("Signup failed: Username already exists.");
  }

  if (usernameCheckError && usernameCheckError.code !== "PGRST116") {
    console.log("Error checking username existence:", usernameCheckError.message);
    isSubmitting = false; // Reset the flag
    throw new Error("Signup failed, please try again.");
  }

  // Check if the email already exists
  const { data: existingUser, error: emailCheckError } = await supabase
    .from("users")
    .select("email")
    .eq("email", email)
    .single();

  if (existingUser) {
    console.log("Signup failed: Email already exists");
    isSubmitting = false; // Reset the flag
    throw new Error("Signup failed: Email already exists.");
  }

  if (emailCheckError && emailCheckError.code !== "PGRST116") {
    console.log("Error checking email existence:", emailCheckError.message);
    isSubmitting = false; // Reset the flag
    throw new Error("Signup failed, please try again.");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  const generatedId = await generateUniqueId();

  // Insert into users table
  const { data: userData, error: userError } = await supabase
    .from("users")
    .insert([{ id: generatedId, username, email, password: hashedPassword }])
    .select("id, username")
    .single();

  if (userError || !userData) {
    console.log("Signup failed:", userError ? userError.message : "Unknown error");
    isSubmitting = false; // Reset the flag
    throw new Error("Signup failed, please try again.");
  }

  console.log("User created:", { id: userData.id, username: userData.username });

  // Insert into userDetails table
  const { error: detailsError } = await supabase
    .from("userDetails")
    .insert([{
      detailsid: userData.id,
      first_name: firstName,
      creative_field: creativeField,
      bday,
      address,
      mobileNo,
      bio,
      email,
      instagram,
      facebook,
      twitter,
      portfolioLink,
      gender,
      status: false,
    }]);

  if (detailsError) {
    console.log("Failed to insert user details:", detailsError.message);
    isSubmitting = false; // Reset the flag
    throw new Error("Signup failed, could not insert user details.");
  }

  console.log("User details added");

  // Create JWT
  const token = await createJWT({ id: userData.id, username: userData.username });

  isSubmitting = false; // Reset the flag after successful submission

  return { id: userData.id, username: userData.username, token };
};




export const getUserDetailsFromToken = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("No token found in local storage");
    }

    const payload = await verifyJWT(token);
    const userId = payload.id;

    const { data, error } = await supabase
      .from('userDetails')
      .select('*')
      .eq('detailsid', userId)
      .single();

    if (error || !data) {
      throw new Error(error ? error.message : "Failed to fetch user details");
    }

    return data;
  } catch (error) {
    // Cast the error to 'Error' to safely access the 'message' property
    if (error instanceof Error) {
      console.error("Failed to retrieve user details:", error.message);
    } else {
      console.error("An unknown error occurred:", error);
    }

    throw new Error("Failed to retrieve user details");
  }
};

export const getSession = () => {
    return localStorage.getItem("token");
};

export const getMessageId = () => {
    return localStorage.getItem("messageId");

};

export const getRole = () => {
    return localStorage.getItem("role");
};

export const getUserName = () => {
      return localStorage.getItem("user");

};

export const removeLocal = () => {
    localStorage.removeItem("messageId");
    localStorage.removeItem("user");
};

export const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("messageId");
    localStorage.removeItem("user");
    localStorage.removeItem("messageTo");
    localStorage.removeItem("Fname");
    localStorage.removeItem("role");
};
export const getFname = () => {
      return localStorage.getItem("Fname");

};



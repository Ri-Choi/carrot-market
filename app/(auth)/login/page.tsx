"use client";

import React from "react";

import SocialLogin from "@/components/social-login";
import { useFormState } from "react-dom";
import Input from "@/components/input";
import Button from "@/components/button";
import { PASSWORD_MIN_LENGTH } from "@/lib/constants";
import login from "./action";

const LogIn = () => {
  const [state, dispatch] = useFormState(login, null); //state = action의 return value

  return (
    <div className="flex flex-col gap-10 py-8 px-6">
      <div className="flex flex-col gap-2 *:font-medium">
        <h1 className="text-2xl">안녕하세요!</h1>
        <h2 className="text-xl">Log in with email and password.</h2>
      </div>
      <form action={dispatch} className="flex flex-col gap-3">
        <Input
          type="email"
          name="email"
          placeholder="Email"
          required
          errors={state?.fieldErrors.email}
        />
        <Input
          type="password"
          name="password"
          placeholder="Password"
          required
          minLength={PASSWORD_MIN_LENGTH}
          errors={state?.fieldErrors.password}
        />
        <Button text="Login" />
      </form>
      <SocialLogin />
    </div>
  );
};

export default LogIn;

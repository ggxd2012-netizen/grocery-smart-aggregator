import { supabase } from "@/integrations/supabase/client";
import appConfig from "@/config/app.config";
import { toast } from "sonner";

export async function signUpWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          locale: "ar",
          timezone: "Asia/Riyadh",
        },
      },
    });

    if (error) {
      console.error("Sign up error:", error);
      throw error;
    }

    // A session is returned only when the Supabase project has "Confirm email" disabled (auto-confirm).
    if (data.session) {
      toast.success("تم إنشاء حسابك وتسجيل دخولك بنجاح!");
      return data;
    }

    if (appConfig.email.autoConfirmEmails) {
      const signedIn = await supabase.auth.signInWithPassword({ email, password });
      if (!signedIn.error && signedIn.data.session) {
        toast.success("تم إنشاء حسابك وتسجيل دخولك بنجاح!");
        return signedIn.data;
      }
    }

    toast.info("تحقق من بريدك الإلكتروني", {
      description: "أرسلنا رابط التأكيد. تحقق من صندوق الوارد والرسائل غير المرغوبة، أو اضغط إعادة الإرسال.",
    });

    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : "فشل التسجيل";
    console.error("Sign up error:", message);
    throw error;
  }
}

export async function resendConfirmation(email: string) {
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: window.location.origin },
  });
  if (error) {
    toast.error(error.message);
    throw error;
  }
  toast.success("تمت إعادة إرسال رسالة التأكيد");
}

export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Sign in error:", error);
      throw error;
    }

    toast.success("تم تسجيل الدخول بنجاح!", {
      description: `مرحباً بك يا ${email}`,
    });

    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : "فشل تسجيل الدخول";
    console.error("Sign in error:", message);
    throw error;
  }
}

export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        skipBrowserWarning: true,
      },
    });

    if (error) {
      console.error("Google sign in error:", error);
      throw error;
    }

    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : "فشل تسجيل الدخول عبر Google";
    console.error("Google sign in error:", message);
    throw error;
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign out error:", error);
      throw error;
    }

    toast.success("تم تسجيل الخروج بنجاح");
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : "فشل تسجيل الخروج";
    console.error("Sign out error:", message);
    throw error;
  }
}

export async function resetPassword(email: string) {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      console.error("Reset password error:", error);
      throw error;
    }

    toast.success("تم إرسال رابط إعادة تعيين كلمة المرور", {
      description: "تحقق من بريدك الإلكتروني",
    });

    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : "فشل إرسال رابط إعادة التعيين";
    console.error("Reset password error:", message);
    throw error;
  }
}

export async function verifyEmailToken(token: string) {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: "email",
    });

    if (error) {
      console.error("Email verification error:", error);
      throw error;
    }

    toast.success("تم تأكيد بريدك الإلكتروني بنجاح!");
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : "فشل التحقق من البريد الإلكتروني";
    console.error("Email verification error:", message);
    throw error;
  }
}

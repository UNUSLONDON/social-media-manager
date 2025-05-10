
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, ArrowLeft } from "lucide-react";

export default function LinkExpired() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-muted p-3">
                <Clock className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Link Expired</CardTitle>
            <CardDescription className="text-center">
              The password reset link has expired or is invalid
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              Password reset links are valid for 24 hours. You'll need to request a new password reset link.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button asChild className="w-full">
              <Link to="/forgot-password">
                Request New Link
              </Link>
            </Button>
            <Link to="/login" className="inline-flex items-center justify-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

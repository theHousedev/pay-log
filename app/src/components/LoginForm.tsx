import { type FormEvent } from 'react'
import { getAPIPath } from '@/utils/backend'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useNavigate } from 'react-router-dom'

export default function LoginForm() {
    const { refreshAuth } = useAuth()
    const navigate = useNavigate()
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)

        try {
            const response = await fetch(`${getAPIPath()}/login`, {
                method: 'POST',
                body: formData,
            })
            const data = await response.json()

            if (data.status === 'success') {
                await refreshAuth()
                navigate('/')
            } else {
                alert(data.message || 'Login failed')
            }
        } catch (error) {
            alert('Login failed. Please try again.')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Pay Logbook</CardTitle>
                    <p className="text-muted-foreground">Sign in</p>
                </CardHeader>
                <CardContent>
                    <form
                        action="/api/login"
                        method="POST"
                        onSubmit={handleSubmit}
                        className="space-y-4"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                required
                                autoComplete="username"
                                placeholder="Enter your username"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                autoComplete="current-password"
                                placeholder="Enter your password"
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Sign In
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
import { createClient } from '@supabase/supabase-js'

// Food SaaS - Novo Projeto Supabase
const supabaseUrl = 'https://fszqpfbpaxpdzztbxhiv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzenFwZmJwYXhwZHp6dGJ4aGl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MTkyMTEsImV4cCI6MjA4MTQ5NTIxMX0.c1aHtEfLUMNIDZ1jtCaDbm9aHAxyH50EEiHe5JWxflM'

export const supabase = createClient(supabaseUrl, supabaseKey)

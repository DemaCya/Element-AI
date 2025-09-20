const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'https://phnjphoasardqhgocaps.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBobmpwaG9hc2FyZHFoZ29jYXBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTIxMzUsImV4cCI6MjA3MzY4ODEzNX0.ltvf0CdchuxmCip0fI9qSzAnX25ijT-0mKrhm0Yft_I'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestUser() {
  const testUsers = [
    {
      email: 'admin.test.2024@gmail.com',
      password: 'Admin123!',
      fullName: 'Admin User'
    },
    {
      email: 'test.user.2024@gmail.com',
      password: 'Test123!',
      fullName: 'Test User'
    }
  ]

  for (const user of testUsers) {
    try {
      console.log(`Creating user: ${user.email}`)

      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            full_name: user.fullName,
          }
        }
      })

      if (error) {
        if (error.message.includes('already registered')) {
          console.log(`User ${user.email} already exists`)
        } else {
          console.error('Error creating user:', error.message)
        }
        continue
      }

      console.log(`✅ User ${user.email} created successfully!`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Password: ${user.password}`)
      console.log(`   Full Name: ${user.fullName}`)
      console.log('')

    } catch (error) {
      console.error('Error:', error.message)
    }
  }
}

createTestUser()
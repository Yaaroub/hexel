'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useState } from 'react'

const schema = z.object({
  name: z.string().min(2, { message: 'Name muss mindestens 2 Zeichen haben' }),
  email: z.string().email({ message: 'Ungültige E-Mail-Adresse' }),
  message: z.string().min(10, { message: 'Nachricht muss mindestens 10 Zeichen haben' }),
})

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setSubmitMessage('Nachricht erfolgreich gesendet!')
        reset()
      } else {
        setSubmitMessage('Fehler beim Senden der Nachricht.')
      }
    } catch (error) {
      setSubmitMessage('Ein Fehler ist aufgetreten.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-hexel-secondary rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-hexel-light">Kontaktieren Sie uns</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-hexel-light">
            Name
          </label>
          <input
            {...register('name')}
            type="text"
            id="name"
            className="mt-1 block w-full p-2 border border-hexel-accent rounded-md bg-hexel-primary text-hexel-light"
          />
          {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-hexel-light">
            E-Mail
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            className="mt-1 block w-full p-2 border border-hexel-accent rounded-md bg-hexel-primary text-hexel-light"
          />
          {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-hexel-light">
            Nachricht
          </label>
          <textarea
            {...register('message')}
            id="message"
            rows={4}
            className="mt-1 block w-full p-2 border border-hexel-accent rounded-md bg-hexel-primary text-hexel-light"
          />
          {errors.message && <p className="text-red-400 text-sm mt-1">{errors.message.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-hexel-accent text-hexel-light py-2 px-4 rounded-md hover:bg-hexel-accent/90 transition-colors"
        >
          {isSubmitting ? 'Wird gesendet...' : 'Nachricht senden'}
        </button>

        {submitMessage && <p className="mt-4 text-center text-hexel-light">{submitMessage}</p>}
      </form>
    </div>
  )
}

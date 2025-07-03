'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { FiCheckCircle, FiAlertCircle, FiSend, FiLoader } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

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
  } = useForm({ resolver: zodResolver(schema) })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitStatus(null);
  
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
  
      const responseData = await res.json();
  
      if (res.ok) {
        setSubmitStatus({ type: 'success', message: responseData.message });
        reset();
      } else {
        setSubmitStatus({ type: 'error', message: responseData.message || 'Ein Fehler ist aufgetreten.' });
      }
    } catch {
      setSubmitStatus({ type: 'error', message: 'Fehler! Bitte versuchen Sie es später erneut.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  };

  const headingAnimation = {
    initial: { scale: 0.95 },
    animate: { scale: 1 },
  };

  return (
    <section className="py-16 px-4">
      <motion.div
        className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8 sm:p-12"
        {...containerAnimation}
      >
        <div className="text-center">
          <motion.h2
            className="text-4xl font-bold text-[#5d5247] mb-2"
            {...headingAnimation}
          >
            Kontaktieren Sie uns
          </motion.h2>
          <p className="text-[#b29d88] text-lg">Wir antworten innerhalb von 24 Stunden</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {['name', 'email', 'message'].map((field, index) => (
            <motion.div
              key={field}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <label htmlFor={field} className="block text-[#5d5247] font-medium ">
                {field === 'message' ? 'Nachricht' : field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              {field === 'message' ? (
                <textarea
                  {...register(field)}
                  id={field}
                  rows={4}
                  className={`w-full px-5 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 ${
                    errors[field] 
                      ? 'border-red-300 focus:ring-red-200' 
                      : 'border-[#e0d7cf] focus:border-[#b29d88] focus:ring-[#f0eae4]'
                  }`}
                />
              ) : (
                <input
                  {...register(field)}
                  type={field === 'email' ? 'email' : 'text'}
                  id={field}
                  className={`w-full px-5 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 ${
                    errors[field] 
                      ? 'border-red-300 focus:ring-red-200' 
                      : 'border-[#e0d7cf] focus:border-[#b29d88] focus:ring-[#f0eae4]'
                  }`}
                />
              )}
              {errors[field] && (
                <motion.p
                  className="text-red-500 text-sm mt-2 flex items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <FiAlertCircle className="mr-2" /> {errors[field].message}
                </motion.p>
              )}
            </motion.div>
          ))}

          <motion.button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-[#b29d88] to-[#9c8875] text-white py-2 rounded-xl font-medium hover:opacity-90 transition-opacity duration-300 flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? (
              <>
                <FiLoader className="animate-spin" />
                <span>Wird gesendet...</span>
              </>
            ) : (
              <>
                <FiSend />
                <span>Nachricht senden</span>
              </>
            )}
          </motion.button>
        </form>

        <AnimatePresence>
          {submitStatus && (
            <motion.div
              className={`mt-6 p-4 rounded-lg flex items-center space-x-3 border ${
                submitStatus.type === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-700' 
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {submitStatus.type === 'success' ? (
                <FiCheckCircle className="flex-shrink-0" />
              ) : (
                <FiAlertCircle className="flex-shrink-0" />
              )}
              <span>{submitStatus.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  )
}

export const BOOKING_ERRORS = {
  NOT_FOUND: 'Reserva no encontrada.',
  SLOT_UNAVAILABLE: 'El horario seleccionado ya no está disponible.',
  CANCELLATION_WINDOW: 'No es posible cancelar con tan poco tiempo de anticipación.',
  ALREADY_CANCELLED: 'Esta reserva ya fue cancelada.',
  INVALID_STATUS_TRANSITION: 'No es posible realizar esta acción en el estado actual de la reserva.',
} as const

export type BookingErrorCode = keyof typeof BOOKING_ERRORS

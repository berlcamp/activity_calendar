'use client'

import { Button } from '@/components/ui/button'
import { Employee } from '@/types'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { QRCodeCanvas } from 'qrcode.react'

type ConfirmationModalProps = {
  isOpen: boolean
  onClose: () => void
  selectedItem: Employee
}

export const QrModal = ({
  isOpen,
  onClose,
  selectedItem
}: ConfirmationModalProps) => {
  if (!isOpen) return null

  return (
    <Dialog
      open={isOpen}
      as="div"
      className="relative z-50 focus:outline-none"
      onClose={() => {}}
    >
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-gray-600 opacity-80"
        aria-hidden="true"
      />

      {/* Centered panel container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <DialogPanel
          transition
          className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg backdrop-blur-2xl"
        >
          <DialogTitle as="h3" className="text-base/7 font-medium">
            {selectedItem?.lastname}, {selectedItem?.firstname}{' '}
            {selectedItem?.middlename}
          </DialogTitle>
          <div className="mt-8">
            <QRCodeCanvas
              value={`https://aoadmin.sortbrite.com/employee/${selectedItem?.id_number}`}
              size={150}
            />
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}

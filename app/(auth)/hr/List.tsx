'use client'

import { ConfirmationModal } from '@/components/ConfirmationModal'
import { useAppDispatch } from '@/lib/redux/hook'
import { deleteItem } from '@/lib/redux/listSlice'
import { supabase } from '@/lib/supabase/client'
import { Employee, RootState } from '@/types' // Import the RootState type
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { AddModal } from './AddModal'
import { QrModal } from './QrModal'

// Always update this on other pages
type ItemType = Employee
const table = 'employees'

export const List = ({}) => {
  const dispatch = useAppDispatch()
  const list = useSelector((state: RootState) => state.list.value)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalAddOpen, setModalAddOpen] = useState(false)

  const [showQr, setShowQr] = useState(false)

  const [selectedItem, setSelectedItem] = useState<ItemType | null>(null)

  // Handle opening the confirmation modal for deleting a supplier
  const handleDeleteConfirmation = (item: ItemType) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  const handleEdit = (item: ItemType) => {
    setSelectedItem(item)
    setModalAddOpen(true)
  }

  const handleViewQR = (item: ItemType) => {
    setSelectedItem(item)
    setShowQr(true)
  }

  // Delete Supplier
  const handleDelete = async () => {
    if (selectedItem) {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', selectedItem.id)

      if (error) {
        if (error.code === '23503') {
          toast.error(
            `This customer cannot be deleted as has a referenced record.`
          )
        }
      } else {
        toast.success('Successfully deleted!')

        // delete item to Redux
        dispatch(deleteItem(selectedItem))
        setIsModalOpen(false)
      }
    }
  }

  return (
    <div className="overflow-x-none">
      <table className="app__table">
        <thead className="app__thead">
          <tr>
            <th className="app__th"></th>
            <th className="app__th">Name</th>
            <th className="app__th">ID No</th>
            <th className="app__th">Type</th>
            <th className="app__th">Department</th>
          </tr>
        </thead>
        <tbody>
          {list.map((item: ItemType) => (
            <tr key={item.id} className="app__tr">
              <td className="w-6 pl-4 app__td"></td>
              <td className="app__td">
                <div className="font-medium">
                  <span>
                    {item.lastname}, {item.firstname} {item.middlename}
                  </span>
                </div>
                <div className="mt-2 space-x-2">
                  <span
                    className="text-xs text-blue-800 cursor-pointer font-medium"
                    onClick={() => handleViewQR(item)}
                  >
                    View QR
                  </span>
                  <span>|</span>
                  <span
                    className="text-xs text-blue-800 cursor-pointer font-medium"
                    onClick={() => handleEdit(item)}
                  >
                    Edit
                  </span>
                  <span>|</span>
                  <span
                    className="text-xs text-blue-800 cursor-pointer font-medium"
                    onClick={() => handleDeleteConfirmation(item)}
                  >
                    Delete
                  </span>
                </div>
              </td>
              <td className="app__td">{item.id_number}</td>
              <td className="app__td">{item.type}</td>
              <td className="app__td">{item.department}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        message="Are you sure you want to delete this?"
      />
      <AddModal
        isOpen={modalAddOpen}
        editData={selectedItem}
        onClose={() => setModalAddOpen(false)}
      />
      {selectedItem && (
        <QrModal
          selectedItem={selectedItem}
          isOpen={showQr}
          onClose={() => setShowQr(false)}
        />
      )}
    </div>
  )
}

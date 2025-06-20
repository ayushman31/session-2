'use client';

import { useState, useEffect } from 'react';

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  created_at: string;
}

export default function Home() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts');
      const data = await response.json();
      setContacts(data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingId ? `/api/contacts/${editingId}` : '/api/contacts';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ name: '', email: '', phone: '', message: '' });
        setEditingId(null);
        fetchContacts();
      }
    } catch (error) {
      console.error('Error saving contact:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (contact: Contact) => {
    setFormData({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      message: contact.message
    });
    setEditingId(contact.id);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      try {
        const response = await fetch(`/api/contacts/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchContacts();
        }
      } catch (error) {
        console.error('Error deleting contact:', error);
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', email: '', phone: '', message: '' });
    setEditingId(null);
  };

  return (
    <div className="flex min-h-screen bg-black">
      <div className="w-1/3 bg-black border border-white p-6 m-2 rounded-lg">
        <h1 className="text-2xl font-bold text-white mb-4">
          {editingId ? 'Edit Contact' : 'Add New Contact'}
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="p-2 rounded border border-white bg-black text-white placeholder-gray-400 focus:border-gray-300 focus:outline-none"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="p-2 rounded border border-white bg-black text-white placeholder-gray-400 focus:border-gray-300 focus:outline-none"
            required
          />
          <input
            type="tel"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="p-2 rounded border border-white bg-black text-white placeholder-gray-400 focus:border-gray-300 focus:outline-none"
          />
          <textarea
            placeholder="Message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="p-2 rounded border border-white bg-black text-white placeholder-gray-400 focus:border-gray-300 focus:outline-none resize-none"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-white text-black px-4 py-2 rounded border border-white hover:bg-gray-200 disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingId ? 'Update' : 'Add Contact'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="bg-black text-white px-4 py-2 rounded border border-white hover:bg-gray-800"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
      <div className="w-2/3 bg-black border border-white p-6 m-2 rounded-lg">
        <h1 className="text-4xl font-bold text-white mb-4">Contacts Table</h1>
        <div className="bg-black rounded-lg p-4 max-h-96 overflow-y-auto border border-white">
          {contacts.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No contacts found. Add your first contact!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-900">
                    <th className="border border-white p-2 text-left text-white">Name</th>
                    <th className="border border-white p-2 text-left text-white">Email</th>
                    <th className="border border-white p-2 text-left text-white">Phone</th>
                    <th className="border border-white p-2 text-left text-white">Message</th>
                    <th className="border border-white p-2 text-left text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-900">
                      <td className="border border-white p-2 text-white">{contact.name}</td>
                      <td className="border border-white p-2 text-white">{contact.email}</td>
                      <td className="border border-white p-2 text-white">{contact.phone}</td>
                      <td className="border border-white p-2 max-w-xs truncate text-white">{contact.message}</td>
                      <td className="border border-white p-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(contact)}
                            className="bg-white text-black px-2 py-1 rounded text-sm hover:bg-gray-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(contact.id)}
                            className="bg-black text-white px-2 py-1 rounded border border-white text-sm hover:bg-gray-800"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

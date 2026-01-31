import React, { useState, useEffect } from 'react';
import api from '../api/client';

const Classes = () => {
    const [classes, setClasses] = useState([]);
    const [newClass, setNewClass] = useState({ name: '', description: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const res = await api.get('/classes/');
            setClasses(res.data);
        } catch (error) {
            console.error("Error fetching classes", error);
        }
    };

    const handleCreate = async () => {
        try {
            await api.post('/classes/', newClass);
            setNewClass({ name: '', description: '' });
            fetchClasses();
        } catch (error) {
            console.error("Error creating class", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/classes/${id}`);
            fetchClasses();
        } catch (error) {
            console.error("Error deleting class", error);
        }
    };

    // Simplistic update for demo
    const handleUpdate = async (id) => {
        const cls = classes.find(c => c.id === id);
        try {
            await api.put(`/classes/${id}`, { name: cls.name, description: cls.description });
            setEditingId(null);
            fetchClasses();
        } catch (error) {
            console.error("Error updating class", error);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Class Management</h1>

            {/* Create Form */}
            <div className="bg-white p-4 rounded-lg shadow mb-8">
                <h2 className="text-xl font-semibold mb-4">Add New Class</h2>
                <div className="flex gap-4">
                    <input
                        className="border p-2 rounded w-1/3"
                        placeholder="Class Name"
                        value={newClass.name}
                        onChange={e => setNewClass({ ...newClass, name: e.target.value })}
                    />
                    <input
                        className="border p-2 rounded w-1/2"
                        placeholder="Description"
                        value={newClass.description}
                        onChange={e => setNewClass({ ...newClass, description: e.target.value })}
                    />
                    <button
                        onClick={handleCreate}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Add Class
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map(cls => (
                    <div key={cls.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                        {editingId === cls.id ? (
                            <div className="flex flex-col gap-2">
                                <input
                                    className="border p-1 rounded"
                                    value={cls.name}
                                    onChange={e => setClasses(classes.map(c => c.id === cls.id ? { ...c, name: e.target.value } : c))}
                                />
                                <input
                                    className="border p-1 rounded"
                                    value={cls.description}
                                    onChange={e => setClasses(classes.map(c => c.id === cls.id ? { ...c, description: e.target.value } : c))}
                                />
                                <div className="flex gap-2">
                                    <button onClick={() => handleUpdate(cls.id)} className="bg-green-500 text-white px-2 py-1 rounded">Save</button>
                                    <button onClick={() => setEditingId(null)} className="bg-gray-500 text-white px-2 py-1 rounded">Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-xl font-bold text-gray-800">{cls.name}</h3>
                                <p className="text-gray-600 mb-4">{cls.description}</p>
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setEditingId(cls.id)} className="text-blue-600 hover:text-blue-800">Edit</button>
                                    <button onClick={() => handleDelete(cls.id)} className="text-red-600 hover:text-red-800">Delete</button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
export default Classes;

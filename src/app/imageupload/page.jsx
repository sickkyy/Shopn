'use client'
import React, { useState } from 'react';

export default function ImageUploadPage() {
    const [message, setMessage] = useState('');
    const [uploadedImageUrl, setUploadedImageUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setMessage('');
        setUploadedImageUrl(''); // Clear previous image

        const form = event.target;
        const fileInput = form.elements.imageFile; // Get input by name
        const file = fileInput.files[0];

        if (!file) {
            setMessage('Please select a file to upload.');
            setIsLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('imageFile', file); // Key must match backend ('imageFile')

        try {
            const response = await fetch('/api/upload', { // Your upload API route
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            setMessage(`Success: ${data.message}`);
            // Construct the URL to view the image using the GET API route
            setUploadedImageUrl(`/api/images/${data.filename}`);

        } catch (error) {
            console.error('Upload failed:', error);
            setMessage(`Upload failed: ${error.message}`);
        } finally {
            setIsLoading(false);
            form.reset(); // Clear the file input
        }
    };

    return (
        <div>
            <h1>Image Upload (Local Dev)</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="imageFile">Choose Image:</label>
                    <input
                      type="file"
                      id="imageFile"
                      name="imageFile"  
                      accept="image/png, image/jpeg, image/gif"
                      required
                  />
                </div>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Uploading...' : 'Upload Image'}
                </button>
            </form>

            {message && <p style={{ color: message.startsWith('Success') ? 'green' : 'red' }}>{message}</p>}

            {uploadedImageUrl && (
                <div>
                    <h2>Uploaded Image:</h2>
                    <img
                        src={uploadedImageUrl}
                        alt="Uploaded content"
                        style={{ maxWidth: '500px', maxHeight: '500px', marginTop: '20px' }}
                    />
                     <p>Image URL (for local dev): <a href={uploadedImageUrl} target="_blank" rel="noopener noreferrer">{uploadedImageUrl}</a></p>
                </div>
            )}
        </div>
    );
}



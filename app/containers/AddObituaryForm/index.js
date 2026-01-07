import React, { Component } from 'react';
import { Upload, X, Save, AlertCircle } from 'lucide-react';

class AddObituaryForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formData: {
                firstName: '',
                middleName: '',
                lastName: '',
                birthDate: '',
                deathDate: '',
                age: '',
                location: '',
                biography: '',
                videoUrl: '',
                externalVideo: '',
                embeddedVideo: '',
                serviceType: 'PRIVATE FAMILY SERVICE',
                serviceDate: '',
                serviceLocation: '',
                floralStoreLink: '',
                treePlantingLink: '',
                isPublished: true
            },
            photoFile: null,
            photoPreview: null,
            backgroundFile: null,
            backgroundPreview: null,
            loading: false,
            error: null,
            success: false
        };
    }

    handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        this.setState(prevState => ({
            formData: {
                ...prevState.formData,
                [name]: type === 'checkbox' ? checked : value
            }
        }));
    };

    handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (type === 'photo') {
                this.setState({
                    photoFile: file,
                    photoPreview: URL.createObjectURL(file)
                });
            } else {
                this.setState({
                    backgroundFile: file,
                    backgroundPreview: URL.createObjectURL(file)
                });
            }
        }
    };

    removeFile = (type) => {
        if (type === 'photo') {
            this.setState({ photoFile: null, photoPreview: null });
        } else {
            this.setState({ backgroundFile: null, backgroundPreview: null });
        }
    };

    handleSubmit = async () => {
        const { formData, photoFile, backgroundFile } = this.state;

        if (!formData.firstName || !formData.lastName) {
            this.setState({ error: 'First name and last name are required' });
            return;
        }

        this.setState({ loading: true, error: null, success: false });

        try {
            const submitData = new FormData();

            // Add all form fields
            Object.keys(formData).forEach(key => {
                const value = formData[key];
                // Only append non-empty values
                if (value !== '' && value !== null && value !== undefined) {
                    submitData.append(key, value);
                }
            });

            // DON'T add slug - let backend generate it with timestamp for uniqueness
            // The controller will create: firstname-lastname-timestamp

            // Add files (optional - you can skip these if adding manually to DB)
            if (photoFile) {
                submitData.append('photo', photoFile);
            }
            if (backgroundFile) {
                submitData.append('backgroundImage', backgroundFile);
            }

            // Debug: Log what we're sending
            console.log('Form Data being sent:');
            for (let pair of submitData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            // IMPORTANT: Update this URL to match your backend port
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

            const response = await fetch(`${API_URL}/api/obituaries`, {
                method: 'POST',
                body: submitData,
                // Don't set Content-Type header - browser will set it with boundary
            });

            const data = await response.json();
            console.log('Server response:', data);

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to create obituary');
            }

            this.setState({
                success: true,
                formData: {
                    firstName: '',
                    middleName: '',
                    lastName: '',
                    birthDate: '',
                    deathDate: '',
                    age: '',
                    location: '',
                    biography: '',
                    videoUrl: '',
                    externalVideo: '',
                    embeddedVideo: '',
                    serviceType: 'PRIVATE FAMILY SERVICE',
                    serviceDate: '',
                    serviceLocation: '',
                    floralStoreLink: '',
                    treePlantingLink: '',
                    isPublished: true
                },
                photoFile: null,
                photoPreview: null,
                backgroundFile: null,
                backgroundPreview: null
            });

            // Show success message for 3 seconds
            setTimeout(() => {
                this.setState({ success: false });
            }, 3000);

            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error('Submit error:', err);
            this.setState({ error: err.message });
        } finally {
            this.setState({ loading: false });
        }
    };

    render() {
        const {
            formData,
            photoPreview,
            backgroundPreview,
            loading,
            error,
            success
        } = this.state;

        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Add New Obituary</h1>

                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                                <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                                <div>
                                    <div className="text-red-800 font-medium">Error</div>
                                    <div className="text-red-700 text-sm mt-1">{error}</div>
                                </div>
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="text-green-800 font-medium">✓ Obituary created successfully!</div>
                                <div className="text-green-700 text-sm mt-1">You can now add images manually to the database.</div>
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* Personal Information */}
                            <div className="border-b border-gray-200 pb-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={this.handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Middle Name
                                        </label>
                                        <input
                                            type="text"
                                            name="middleName"
                                            value={formData.middleName}
                                            onChange={this.handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Last Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={this.handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Birth Date
                                        </label>
                                        <input
                                            type="date"
                                            name="birthDate"
                                            value={formData.birthDate}
                                            onChange={this.handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Death Date
                                        </label>
                                        <input
                                            type="date"
                                            name="deathDate"
                                            value={formData.deathDate}
                                            onChange={this.handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Age
                                        </label>
                                        <input
                                            type="number"
                                            name="age"
                                            value={formData.age}
                                            onChange={this.handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={this.handleInputChange}
                                        placeholder="City, State"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Biography */}
                            <div className="border-b border-gray-200 pb-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Biography</h2>
                                <textarea
                                    name="biography"
                                    value={formData.biography}
                                    onChange={this.handleInputChange}
                                    rows="6"
                                    placeholder="Write a meaningful tribute..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Images - Optional */}
                            <div className="border-b border-gray-200 pb-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    Images (Optional - Can add manually to DB later)
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Profile Photo
                                        </label>
                                        {photoPreview ? (
                                            <div className="relative">
                                                <img
                                                    src={photoPreview}
                                                    alt="Preview"
                                                    className="w-full h-48 object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => this.removeFile('photo')}
                                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500">
                                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                                <span className="text-sm text-gray-500">Click to upload photo (optional)</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => this.handleFileChange(e, 'photo')}
                                                    className="hidden"
                                                />
                                            </label>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Background Image
                                        </label>
                                        {backgroundPreview ? (
                                            <div className="relative">
                                                <img
                                                    src={backgroundPreview}
                                                    alt="Preview"
                                                    className="w-full h-48 object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => this.removeFile('background')}
                                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500">
                                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                                <span className="text-sm text-gray-500">Click to upload background (optional)</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => this.handleFileChange(e, 'background')}
                                                    className="hidden"
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Service Information */}
                            <div className="border-b border-gray-200 pb-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Information</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Service Type
                                        </label>
                                        <input
                                            type="text"
                                            name="serviceType"
                                            value={formData.serviceType}
                                            onChange={this.handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Service Date
                                        </label>
                                        <input
                                            type="date"
                                            name="serviceDate"
                                            value={formData.serviceDate}
                                            onChange={this.handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Service Location
                                    </label>
                                    <input
                                        type="text"
                                        name="serviceLocation"
                                        value={formData.serviceLocation}
                                        onChange={this.handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Videos and Links */}
                            <div className="border-b border-gray-200 pb-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Media & Links</h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Video URL
                                        </label>
                                        <input
                                            type="url"
                                            name="videoUrl"
                                            value={formData.videoUrl}
                                            onChange={this.handleInputChange}
                                            placeholder="https://"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Floral Store Link
                                        </label>
                                        <input
                                            type="url"
                                            name="floralStoreLink"
                                            value={formData.floralStoreLink}
                                            onChange={this.handleInputChange}
                                            placeholder="https://"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tree Planting Link
                                        </label>
                                        <input
                                            type="url"
                                            name="treePlantingLink"
                                            value={formData.treePlantingLink}
                                            onChange={this.handleInputChange}
                                            placeholder="https://"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Publish Status */}
                            <div>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isPublished"
                                        checked={formData.isPublished}
                                        onChange={this.handleInputChange}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-700">
                                        Publish immediately
                                    </span>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-6">
                                <button
                                    onClick={this.handleSubmit}
                                    disabled={loading}
                                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5 mr-2" />
                                            Create Obituary
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default AddObituaryForm;
import React, { Component } from 'react';
import axios from 'axios';
import './AddProduct.css';

class AddProduct extends Component {
    state = {
        product: {
            name: '',
            sku: '',
            description: '',
            taxable: false,
            isActive: true
        },
        highlights: [''],
        variants: [
            {
                name: 'Single Tree',
                quantity: 1,
                price: '',
                compareAtPrice: '',
                isDefault: true
            }
        ],
        image: null
    };

    handleProductChange = (field, value) => {
        this.setState({
            product: { ...this.state.product, [field]: value }
        });
    };

    handleHighlightChange = (index, value) => {
        const highlights = [...this.state.highlights];
        highlights[index] = value;
        this.setState({ highlights });
    };

    addHighlight = () => {
        this.setState({ highlights: [...this.state.highlights, ''] });
    };

    handleVariantChange = (index, field, value) => {
        const variants = [...this.state.variants];
        variants[index][field] = value;
        this.setState({ variants });
    };

    addVariant = () => {
        this.setState({
            variants: [
                ...this.state.variants,
                { name: '', quantity: 1, price: '', compareAtPrice: '', isDefault: false }
            ]
        });
    };

    submit = async e => {
        e.preventDefault();

        const { product, highlights, variants, image } = this.state;

        const formData = new FormData();
        formData.append('name', product.name);
        formData.append('sku', product.sku);
        formData.append('description', product.description);
        formData.append('taxable', product.taxable);
        formData.append('isActive', product.isActive);
        formData.append('highlights', JSON.stringify(highlights.filter(h => h)));
        formData.append('variants', JSON.stringify(variants));
        formData.append('image', image);

        await axios.post(' http://localhost:3000/api/product/add', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        alert('Product added successfully');
    };

    render() {
        const { product, highlights, variants } = this.state;

        return (
            <form onSubmit={this.submit} className="max-w-4xl mx-auto space-y-6 p-6">
                <h1 className="text-2xl font-bold">Add Memorial Tree Product</h1>

                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                    <input
                        placeholder="Product Name"
                        className="input"
                        onChange={e => this.handleProductChange('name', e.target.value)}
                    />
                    <input
                        placeholder="SKU"
                        className="input"
                        onChange={e => this.handleProductChange('sku', e.target.value)}
                    />
                </div>

                <textarea
                    placeholder="Description"
                    className="input"
                    onChange={e => this.handleProductChange('description', e.target.value)}
                />

                {/* Highlights */}
                <div>
                    <h2 className="font-semibold mb-2">Highlights (Bullet Points)</h2>
                    {highlights.map((h, i) => (
                        <input
                            key={i}
                            className="input mb-2"
                            placeholder={`Highlight ${i + 1}`}
                            value={h}
                            onChange={e => this.handleHighlightChange(i, e.target.value)}
                        />
                    ))}
                    <button type="button" onClick={this.addHighlight} className="btn-secondary">+ Add Highlight</button>
                </div>

                {/* Variants */}
                <div>
                    <h2 className="font-semibold mb-2">Variants</h2>
                    {variants.map((v, i) => (
                        <div key={i} className="border p-4 mb-4 rounded-xl">
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    placeholder="Variant Name"
                                    className="input"
                                    value={v.name}
                                    onChange={e => this.handleVariantChange(i, 'name', e.target.value)}
                                />
                                <input
                                    type="number"
                                    placeholder="Quantity"
                                    className="input"
                                    value={v.quantity}
                                    onChange={e => this.handleVariantChange(i, 'quantity', e.target.value)}
                                />
                                <input
                                    type="number"
                                    placeholder="Price"
                                    className="input"
                                    value={v.price}
                                    onChange={e => this.handleVariantChange(i, 'price', e.target.value)}
                                />
                                <input
                                    type="number"
                                    placeholder="Compare At Price"
                                    className="input"
                                    value={v.compareAtPrice}
                                    onChange={e => this.handleVariantChange(i, 'compareAtPrice', e.target.value)}
                                />
                            </div>

                            <label className="flex items-center gap-2 mt-2">
                                <input
                                    type="checkbox"
                                    checked={v.isDefault}
                                    onChange={e => this.handleVariantChange(i, 'isDefault', e.target.checked)}
                                />
                                Default Variant
                            </label>
                        </div>
                    ))}
                    <button type="button" onClick={this.addVariant} className="btn-secondary">+ Add Variant</button>
                </div>

                {/* Image */}
                <div>
                    <h2 className="font-semibold mb-2">Product Image</h2>
                    <input type="file" onChange={e => this.setState({ image: e.target.files[0] })} />
                </div>

                {/* Toggles */}
                <div className="flex gap-6">
                    <label className="flex gap-2 items-center">
                        <input
                            type="checkbox"
                            onChange={e => this.handleProductChange('taxable', e.target.checked)}
                        /> Taxable
                    </label>
                    <label className="flex gap-2 items-center">
                        <input
                            type="checkbox"
                            defaultChecked
                            onChange={e => this.handleProductChange('isActive', e.target.checked)}
                        /> Active
                    </label>
                </div>

                <button className="btn-primary w-full">Save Product</button>
            </form>
        );
    }
}

export default AddProduct;
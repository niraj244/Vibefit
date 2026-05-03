import React, { useContext, useEffect, useState } from 'react';
import { Button, TextField, Select, MenuItem, FormControl, InputLabel, Chip } from '@mui/material';
import { fetchDataFromApi, postData, deleteData } from '../../utils/api';
import { MyContext } from '../../App';
import { RiCoupon3Line } from 'react-icons/ri';
import { MdDeleteOutline } from 'react-icons/md';
import { MdToggleOn, MdToggleOff } from 'react-icons/md';

const SUPER_ADMIN_EMAIL = 'nirajtamang244@gmail.com';

const Coupons = () => {
    const context = useContext(MyContext);
    const isSuperAdmin = context?.userData?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    const [form, setForm] = useState({
        code: '',
        type: 'flat',
        value: '',
        minOrderAmount: '1000',
        assignedToEmail: '',
        expiresAt: '',
    });

    const loadCoupons = () => {
        setLoading(true);
        fetchDataFromApi('/api/coupon/list').then((res) => {
            setCoupons(res?.data || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => { loadCoupons(); }, []);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCreate = async () => {
        if (!form.code || !form.value) {
            context.alertBox('error', 'Code and value are required');
            return;
        }
        setCreating(true);
        const res = await postData('/api/coupon/create', form);
        if (res?.error === false) {
            context.alertBox('success', res.message);
            setForm({ code: '', type: 'flat', value: '', minOrderAmount: '1000', assignedToEmail: '', expiresAt: '' });
            loadCoupons();
        } else {
            context.alertBox('error', res?.message || 'Failed to create coupon');
        }
        setCreating(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this coupon?')) return;
        const res = await deleteData(`/api/coupon/${id}`);
        if (res?.error === false) {
            context.alertBox('success', 'Coupon deleted');
            loadCoupons();
        } else {
            context.alertBox('error', res?.message || 'Failed to delete');
        }
    };

    const handleToggle = async (id) => {
        const res = await fetch(import.meta.env.VITE_API_URL + `/api/coupon/toggle/${id}`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
        });
        const data = await res.json();
        if (data?.error === false) {
            loadCoupons();
        } else {
            context.alertBox('error', data?.message || 'Failed');
        }
    };

    const discountLabel = (c) => {
        if (c.type === 'flat') return `Rs. ${c.value.toLocaleString()} off`;
        return `${c.value}% off`;
    };

    return (
        <div className="p-5">
            <div className="flex items-center gap-3 mb-6">
                <RiCoupon3Line className="text-[28px] text-[#FFA239]" />
                <h2 className="text-[22px] font-[700]">Coupon Codes</h2>
            </div>

            {isSuperAdmin && (
                <div className="bg-white rounded-lg shadow-sm border border-[rgba(0,0,0,0.1)] p-5 mb-6">
                    <h3 className="text-[16px] font-[600] mb-4">Create New Coupon</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <TextField
                            label="Coupon Code *"
                            name="code"
                            value={form.code}
                            onChange={handleChange}
                            size="small"
                            placeholder="e.g. VIBEFIT250"
                            inputProps={{ style: { textTransform: 'uppercase' } }}
                        />
                        <FormControl size="small">
                            <InputLabel>Type *</InputLabel>
                            <Select name="type" value={form.type} onChange={handleChange} label="Type *">
                                <MenuItem value="flat">Flat (Rs. X off)</MenuItem>
                                <MenuItem value="percent">Percent (X% off)</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label={form.type === 'flat' ? 'Amount (Rs.) *' : 'Percentage (%) *'}
                            name="value"
                            value={form.value}
                            onChange={handleChange}
                            size="small"
                            type="number"
                            placeholder={form.type === 'flat' ? '250' : '20'}
                        />
                        <TextField
                            label="Min. Order Amount (Rs.)"
                            name="minOrderAmount"
                            value={form.minOrderAmount}
                            onChange={handleChange}
                            size="small"
                            type="number"
                            placeholder="1000"
                        />
                        <TextField
                            label="Assign to Customer Email (optional)"
                            name="assignedToEmail"
                            value={form.assignedToEmail}
                            onChange={handleChange}
                            size="small"
                            placeholder="customer@email.com"
                        />
                        <TextField
                            label="Expiry Date (optional)"
                            name="expiresAt"
                            value={form.expiresAt}
                            onChange={handleChange}
                            size="small"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                        />
                    </div>
                    <div className="mt-4">
                        <Button
                            className="btn-org"
                            onClick={handleCreate}
                            disabled={creating}
                            variant="contained"
                            style={{ backgroundColor: '#FFA239', color: '#fff', textTransform: 'none', fontWeight: 600 }}
                        >
                            {creating ? 'Creating...' : 'Create Coupon'}
                        </Button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-[rgba(0,0,0,0.1)] overflow-hidden">
                <table className="w-full text-[13px]">
                    <thead className="bg-[#f5f5f5] text-[rgba(0,0,0,0.6)] uppercase text-[11px]">
                        <tr>
                            <th className="text-left p-3 font-[600]">Code</th>
                            <th className="text-left p-3 font-[600]">Discount</th>
                            <th className="text-left p-3 font-[600]">Min. Order</th>
                            <th className="text-left p-3 font-[600]">Assigned To</th>
                            <th className="text-left p-3 font-[600]">Status</th>
                            <th className="text-left p-3 font-[600]">Used By</th>
                            <th className="text-left p-3 font-[600]">Expires</th>
                            {isSuperAdmin && <th className="text-left p-3 font-[600]">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={8} className="text-center p-6 text-[rgba(0,0,0,0.4)]">Loading...</td></tr>
                        ) : coupons.length === 0 ? (
                            <tr><td colSpan={8} className="text-center p-6 text-[rgba(0,0,0,0.4)]">No coupons yet</td></tr>
                        ) : coupons.map((c) => (
                            <tr key={c._id} className="border-t border-[rgba(0,0,0,0.06)] hover:bg-[#fafafa]">
                                <td className="p-3 font-[700] text-[#FFA239] tracking-wider">{c.code}</td>
                                <td className="p-3 font-[600]">{discountLabel(c)}</td>
                                <td className="p-3">Rs. {c.minOrderAmount?.toLocaleString()}</td>
                                <td className="p-3 text-[rgba(0,0,0,0.6)]">
                                    {c.assignedToEmail || <span className="text-[rgba(0,0,0,0.3)]">Anyone</span>}
                                </td>
                                <td className="p-3">
                                    {c.isUsed ? (
                                        <Chip label="Used" size="small" color="default" />
                                    ) : c.isActive ? (
                                        <Chip label="Active" size="small" style={{ backgroundColor: '#dcfce7', color: '#166534' }} />
                                    ) : (
                                        <Chip label="Inactive" size="small" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }} />
                                    )}
                                </td>
                                <td className="p-3 text-[rgba(0,0,0,0.5)]">
                                    {c.usedBy ? c.usedBy.slice(-6) + '...' : '—'}
                                </td>
                                <td className="p-3 text-[rgba(0,0,0,0.5)]">
                                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '—'}
                                </td>
                                {isSuperAdmin && (
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            {!c.isUsed && (
                                                <button
                                                    onClick={() => handleToggle(c._id)}
                                                    title={c.isActive ? 'Deactivate' : 'Activate'}
                                                    className="text-[22px] text-[rgba(0,0,0,0.5)] hover:text-[#FFA239]"
                                                >
                                                    {c.isActive ? <MdToggleOn className="text-green-500" /> : <MdToggleOff />}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(c._id)}
                                                className="text-[18px] text-red-400 hover:text-red-600"
                                                title="Delete"
                                            >
                                                <MdDeleteOutline />
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Coupons;

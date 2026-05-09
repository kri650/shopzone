import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import './Profile.css';

const Profile = () => {
  const { user, setUser, refreshMe } = useAuth();
  const [saving, setSaving] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [profile, setProfile] = useState({ name: '', phone: '' });
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    isDefault: false
  });

  useEffect(() => {
    if (!user) return;
    setProfile({ name: user.name || '', phone: user.phone || '' });
    setAddressForm((p) => ({
      ...p,
      fullName: user.name || p.fullName,
      phone: user.phone || p.phone
    }));
  }, [user]);

  const addresses = useMemo(() => user?.addresses || [], [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await userService.updateProfile({ name: profile.name, phone: profile.phone });
      setUser(updated);
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setAddressSaving(true);
    try {
      await userService.addAddress(addressForm);
      await refreshMe();
      toast.success('Address added.');
      setAddressForm((p) => ({ ...p, addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', isDefault: false }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add address.');
    } finally {
      setAddressSaving(false);
    }
  };

  const setDefault = async (addressId) => {
    try {
      await userService.setDefaultAddress(addressId);
      await refreshMe();
      toast.success('Default address updated.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not set default address.');
    }
  };

  const remove = async (addressId) => {
    const ok = window.confirm('Remove this address?');
    if (!ok) return;
    try {
      await userService.deleteAddress(addressId);
      await refreshMe();
      toast.success('Address removed.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not remove address.');
    }
  };

  return (
    <div className="profile-page container">
      <h1>Your Account</h1>
      
      <div className="profile-content">
        <div className="profile-card">
          <h2>Profile Information</h2>
          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={user?.email || ''} disabled />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
          </form>

          <div id="addresses" style={{ marginTop: 24 }}>
            <h2 style={{ marginBottom: 12 }}>Saved Addresses</h2>
            {addresses.length === 0 ? (
              <div className="empty-state">
                <p>No saved addresses yet.</p>
              </div>
            ) : (
              <div className="address-list">
                {addresses.map((a) => (
                  <div className="address-card" key={a._id}>
                    <div className="address-head">
                      <div>
                        <strong>{a.label}</strong> {a.isDefault && <span className="address-default">Default</span>}
                      </div>
                      <div className="address-actions">
                        {!a.isDefault && (
                          <button className="btn btn-outline btn-sm" type="button" onClick={() => setDefault(a._id)}>
                            Set default
                          </button>
                        )}
                        <button className="btn btn-outline btn-sm" type="button" onClick={() => remove(a._id)}>Remove</button>
                      </div>
                    </div>
                    <div className="address-body">
                      <div>{a.fullName} • {a.phone}</div>
                      <div>{a.addressLine1}{a.addressLine2 ? `, ${a.addressLine2}` : ''}</div>
                      <div>{a.city}, {a.state} - {a.pincode}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h2 style={{ marginTop: 18, marginBottom: 12 }}>Add New Address</h2>
            <form className="address-form" onSubmit={handleAddAddress}>
              <div className="form-row">
                <div className="form-group">
                  <label>Label</label>
                  <select value={addressForm.label} onChange={(e) => setAddressForm((p) => ({ ...p, label: e.target.value }))}>
                    <option>Home</option>
                    <option>Work</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Default</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                    <input type="checkbox" checked={addressForm.isDefault} onChange={(e) => setAddressForm((p) => ({ ...p, isDefault: e.target.checked }))} />
                    <span>Set as default</span>
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input value={addressForm.fullName} onChange={(e) => setAddressForm((p) => ({ ...p, fullName: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input value={addressForm.phone} onChange={(e) => setAddressForm((p) => ({ ...p, phone: e.target.value }))} required />
                </div>
              </div>
              <div className="form-group">
                <label>Address Line 1</label>
                <input value={addressForm.addressLine1} onChange={(e) => setAddressForm((p) => ({ ...p, addressLine1: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Address Line 2 (optional)</label>
                <input value={addressForm.addressLine2} onChange={(e) => setAddressForm((p) => ({ ...p, addressLine2: e.target.value }))} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input value={addressForm.city} onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input value={addressForm.state} onChange={(e) => setAddressForm((p) => ({ ...p, state: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Pincode</label>
                  <input value={addressForm.pincode} onChange={(e) => setAddressForm((p) => ({ ...p, pincode: e.target.value }))} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={addressSaving}>{addressSaving ? 'Saving…' : 'Add Address'}</button>
            </form>
          </div>
        </div>

        <div className="profile-sidebar">
          <div className="sidebar-card">
            <h3>Account Options</h3>
            <ul className="account-links">
              <li><a href="/my-orders">Your Orders</a></li>
              <li><a href="/wishlist">Your Wishlist</a></li>
              <li><a href="#addresses">Your Addresses</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

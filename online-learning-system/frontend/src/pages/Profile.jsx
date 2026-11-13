
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
    getMyProfile,
    updateMyProfile,
    changeMyPassword
} from "../services/userService";
import "./Profile.css";

function Profile() {
    const [profile, setProfile] = useState(null);

    const [name, setName] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    const [profileMessage, setProfileMessage] = useState("");
    const [passwordMessage, setPasswordMessage] = useState("");

    const [profileError, setProfileError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);

            const data = await getMyProfile();

            setProfile(data);
            setName(data.name || "");
        } catch (error) {
            setProfileError(
                error.response?.data?.message ||
                "Unable to load your profile."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (event) => {
        event.preventDefault();

        setProfileMessage("");
        setProfileError("");

        if (!name.trim()) {
            setProfileError("Name cannot be empty.");
            return;
        }

        try {
            setProfileLoading(true);

            const updatedProfile = await updateMyProfile({
                name: name.trim()
            });

            setProfile(updatedProfile);
            setName(updatedProfile.name);

            setProfileMessage("Profile updated successfully.");
        } catch (error) {
            setProfileError(
                error.response?.data?.message ||
                "Unable to update your profile."
            );
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordChange = async (event) => {
        event.preventDefault();

        setPasswordMessage("");
        setPasswordError("");

        if (newPassword.length < 8) {
            setPasswordError(
                "New password must contain at least 8 characters."
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords do not match.");
            return;
        }

        try {
            setPasswordLoading(true);

            const response = await changeMyPassword({
                currentPassword,
                newPassword
            });

            setPasswordMessage(
                response.message || "Password updated successfully."
            );

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            setPasswordError(
                error.response?.data?.message ||
                "Unable to change your password."
            );
        } finally {
            setPasswordLoading(false);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="profile-loading">
                    <div className="spinner-border text-primary" />
                    <p>Loading your profile...</p>
                </div>
            </>
        );
    }

    if (!profile) {
        return (
            <>
                <Navbar />
                <div className="container py-5">
                    <div className="alert alert-danger">
                        {profileError || "Profile could not be loaded."}
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={fetchProfile}
                    >
                        Try Again
                    </button>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />

            <div className="profile-page">
                <div className="container">

                    {/* Page heading */}
                    <div className="profile-heading">
                        <div>
                            <span className="profile-eyebrow">
                                ACCOUNT SETTINGS
                            </span>
                            <h2>My Profile</h2>
                            <p>
                                Manage your personal information
                                and account security.
                            </p>
                        </div>
                    </div>

                    <div className="row g-4">

                        {/* Profile information */}
                        <div className="col-lg-5">
                            <div className="profile-card profile-overview">

                                <div className="profile-avatar">
                                    {profile.name?.charAt(0)?.toUpperCase() || "U"}
                                </div>

                                <h4>{profile.name}</h4>
                                <p className="profile-email">
                                    {profile.email}
                                </p>

                                <span className="profile-role">
                                    {profile.role}
                                </span>

                                <div className="profile-divider" />

                                <div className="profile-detail">
                                    <span>Account ID</span>
                                    <strong>{profile.id}</strong>
                                </div>

                                <div className="profile-detail">
                                    <span>Account Role</span>
                                    <strong>{profile.role}</strong>
                                </div>

                                <div className="profile-detail">
                                    <span>Account Status</span>

                                    <span
                                        className={`account-status ${
                                            profile.active
                                                ? "status-active"
                                                : "status-inactive"
                                        }`}
                                    >
                                        {profile.active
                                            ? "Active"
                                            : "Inactive"}
                                    </span>
                                </div>

                            </div>
                        </div>

                        {/* Edit profile */}
                        <div className="col-lg-7">
                            <div className="profile-card">

                                <div className="profile-card-heading">
                                    <div>
                                        <h4>Personal Information</h4>
                                        <p>
                                            Update your profile details.
                                        </p>
                                    </div>
                                    <i className="bi bi-person-gear" />
                                </div>

                                {profileMessage && (
                                    <div className="alert alert-success">
                                        {profileMessage}
                                    </div>
                                )}

                                {profileError && (
                                    <div className="alert alert-danger">
                                        {profileError}
                                    </div>
                                )}

                                <form onSubmit={handleProfileUpdate}>

                                    <div className="mb-3">
                                        <label className="form-label">
                                            Full Name
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            value={name}
                                            onChange={(e) =>
                                                setName(e.target.value)
                                            }
                                            maxLength={100}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">
                                            Email Address
                                        </label>

                                        <input
                                            type="email"
                                            className="form-control"
                                            value={profile.email}
                                            disabled
                                        />

                                        <small className="text-muted">
                                            Email address cannot be changed here.
                                        </small>
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label">
                                            Account Role
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            value={profile.role}
                                            disabled
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary profile-button"
                                        disabled={profileLoading}
                                    >
                                        {profileLoading
                                            ? "Saving..."
                                            : "Save Changes"}
                                    </button>

                                </form>
                            </div>
                        </div>

                        {/* Change password */}
                        <div className="col-12">
                            <div className="profile-card">

                                <div className="profile-card-heading">
                                    <div>
                                        <h4>Change Password</h4>
                                        <p>
                                            Keep your account secure by
                                            updating your password.
                                        </p>
                                    </div>

                                    <i className="bi bi-shield-lock" />
                                </div>

                                {passwordMessage && (
                                    <div className="alert alert-success">
                                        {passwordMessage}
                                    </div>
                                )}

                                {passwordError && (
                                    <div className="alert alert-danger">
                                        {passwordError}
                                    </div>
                                )}

                                <form onSubmit={handlePasswordChange}>
                                    <div className="row">

                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">
                                                Current Password
                                            </label>

                                            <input
                                                type="password"
                                                className="form-control"
                                                value={currentPassword}
                                                onChange={(e) =>
                                                    setCurrentPassword(
                                                        e.target.value
                                                    )
                                                }
                                                autoComplete="current-password"
                                                required
                                            />
                                        </div>

                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">
                                                New Password
                                            </label>

                                            <input
                                                type="password"
                                                className="form-control"
                                                value={newPassword}
                                                onChange={(e) =>
                                                    setNewPassword(
                                                        e.target.value
                                                    )
                                                }
                                                minLength={8}
                                                maxLength={100}
                                                autoComplete="new-password"
                                                required
                                            />
                                        </div>

                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">
                                                Confirm New Password
                                            </label>

                                            <input
                                                type="password"
                                                className="form-control"
                                                value={confirmPassword}
                                                onChange={(e) =>
                                                    setConfirmPassword(
                                                        e.target.value
                                                    )
                                                }
                                                minLength={8}
                                                maxLength={100}
                                                autoComplete="new-password"
                                                required
                                            />
                                        </div>

                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-dark profile-button"
                                        disabled={passwordLoading}
                                    >
                                        {passwordLoading
                                            ? "Updating..."
                                            : "Update Password"}
                                    </button>

                                </form>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}

export default Profile;

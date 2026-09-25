package com.skillportal.notification;

import java.util.List;

public class NotificationDto {

    public static class NotificationItem {
        private Long id;
        private String title;
        private String message;
        private String type; // SYSTEM, ASSIGNMENT, TEST, ANNOUNCEMENT, COURSE
        private String linkUrl;
        private boolean read;
        private String createdAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getLinkUrl() { return linkUrl; }
        public void setLinkUrl(String linkUrl) { this.linkUrl = linkUrl; }

        public boolean isRead() { return read; }
        public void setRead(boolean read) { this.read = read; }

        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    }

    public static class NotificationSummary {
        private int unreadCount;
        private List<NotificationItem> notifications;

        public int getUnreadCount() { return unreadCount; }
        public void setUnreadCount(int unreadCount) { this.unreadCount = unreadCount; }

        public List<NotificationItem> getNotifications() { return notifications; }
        public void setNotifications(List<NotificationItem> notifications) { this.notifications = notifications; }
    }
}

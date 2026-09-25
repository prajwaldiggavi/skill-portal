package com.skillportal.notification;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public NotificationDto.NotificationSummary getUserNotifications(Long userId) {
        List<NotificationDto.NotificationItem> items = notificationRepository.findByUserId(userId);
        int unread = notificationRepository.countUnread(userId);

        NotificationDto.NotificationSummary summary = new NotificationDto.NotificationSummary();
        summary.setNotifications(items);
        summary.setUnreadCount(unread);
        return summary;
    }

    public void markAsRead(Long id, Long userId) {
        notificationRepository.markAsRead(id, userId);
    }

    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsRead(userId);
    }
}

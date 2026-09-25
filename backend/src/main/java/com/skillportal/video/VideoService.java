package com.skillportal.video;

import com.skillportal.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VideoService {

    private final VideoRepository videoRepository;

    public VideoService(VideoRepository videoRepository) {
        this.videoRepository = videoRepository;
    }

    public VideoDto.VideoDetail getVideoById(Long videoId, Long userId) {
        return videoRepository.findVideoById(videoId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Video not found with id: " + videoId));
    }

    @Transactional
    public void updateProgress(Long userId, Long videoId, VideoDto.UpdateProgressRequest req) {
        boolean isCompleted = Boolean.TRUE.equals(req.getCompleted()) || req.getWatchedPercentage() >= 90.0;
        videoRepository.saveOrUpdateProgress(
                userId,
                videoId,
                req.getLastPositionSeconds(),
                req.getWatchedPercentage(),
                isCompleted
        );
    }
}

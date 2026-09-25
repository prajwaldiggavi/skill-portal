package com.skillportal.video;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class VideoDto {

    public static class VideoDetail {
        private Long id;
        private Long topicId;
        private String title;
        private String description;
        private String videoUrl;
        private String thumbnailUrl;
        private int durationSeconds;
        private int lastPositionSeconds;
        private double watchedPercentage;
        private boolean completed;
        private Long nextVideoId;
        private Long prevVideoId;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getTopicId() { return topicId; }
        public void setTopicId(Long topicId) { this.topicId = topicId; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getVideoUrl() { return videoUrl; }
        public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

        public String getThumbnailUrl() { return thumbnailUrl; }
        public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

        public int getDurationSeconds() { return durationSeconds; }
        public void setDurationSeconds(int durationSeconds) { this.durationSeconds = durationSeconds; }

        public int getLastPositionSeconds() { return lastPositionSeconds; }
        public void setLastPositionSeconds(int lastPositionSeconds) { this.lastPositionSeconds = lastPositionSeconds; }

        public double getWatchedPercentage() { return watchedPercentage; }
        public void setWatchedPercentage(double watchedPercentage) { this.watchedPercentage = watchedPercentage; }

        public boolean isCompleted() { return completed; }
        public void setCompleted(boolean completed) { this.completed = completed; }

        public Long getNextVideoId() { return nextVideoId; }
        public void setNextVideoId(Long nextVideoId) { this.nextVideoId = nextVideoId; }

        public Long getPrevVideoId() { return prevVideoId; }
        public void setPrevVideoId(Long prevVideoId) { this.prevVideoId = prevVideoId; }
    }

    public static class UpdateProgressRequest {
        @NotNull(message = "Last position in seconds is required")
        @Min(0)
        private Integer lastPositionSeconds;

        @NotNull(message = "Watched percentage is required")
        @Min(0)
        @Max(100)
        private Double watchedPercentage;

        private Boolean completed = false;

        public Integer getLastPositionSeconds() { return lastPositionSeconds; }
        public void setLastPositionSeconds(Integer lastPositionSeconds) { this.lastPositionSeconds = lastPositionSeconds; }

        public Double getWatchedPercentage() { return watchedPercentage; }
        public void setWatchedPercentage(Double watchedPercentage) { this.watchedPercentage = watchedPercentage; }

        public Boolean getCompleted() { return completed; }
        public void setCompleted(Boolean completed) { this.completed = completed; }
    }
}

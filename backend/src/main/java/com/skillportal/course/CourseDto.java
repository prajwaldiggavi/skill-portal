package com.skillportal.course;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class CourseDto {

    public static class CourseSummary {
        private Long id;
        private String title;
        private String slug;
        private String description;
        private String thumbnailUrl;
        private int orderIndex;
        private boolean published;
        private int subjectCount;
        private int topicCount;
        private double studentProgressPercentage;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getSlug() { return slug; }
        public void setSlug(String slug) { this.slug = slug; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getThumbnailUrl() { return thumbnailUrl; }
        public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

        public int getOrderIndex() { return orderIndex; }
        public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }

        public boolean isPublished() { return published; }
        public void setPublished(boolean published) { this.published = published; }

        public int getSubjectCount() { return subjectCount; }
        public void setSubjectCount(int subjectCount) { this.subjectCount = subjectCount; }

        public int getTopicCount() { return topicCount; }
        public void setTopicCount(int topicCount) { this.topicCount = topicCount; }

        public double getStudentProgressPercentage() { return studentProgressPercentage; }
        public void setStudentProgressPercentage(double studentProgressPercentage) { this.studentProgressPercentage = studentProgressPercentage; }
    }

    public static class CourseDetail {
        private Long id;
        private String title;
        private String slug;
        private String description;
        private String thumbnailUrl;
        private List<SubjectDetail> subjects;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getSlug() { return slug; }
        public void setSlug(String slug) { this.slug = slug; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getThumbnailUrl() { return thumbnailUrl; }
        public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

        public List<SubjectDetail> getSubjects() { return subjects; }
        public void setSubjects(List<SubjectDetail> subjects) { this.subjects = subjects; }
    }

    public static class SubjectDetail {
        private Long id;
        private Long courseId;
        private String title;
        private String description;
        private int orderIndex;
        private List<ModuleDetail> modules;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getCourseId() { return courseId; }
        public void setCourseId(Long courseId) { this.courseId = courseId; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public int getOrderIndex() { return orderIndex; }
        public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }

        public List<ModuleDetail> getModules() { return modules; }
        public void setModules(List<ModuleDetail> modules) { this.modules = modules; }
    }

    public static class ModuleDetail {
        private Long id;
        private Long subjectId;
        private String title;
        private String description;
        private int orderIndex;
        private List<TopicSummary> topics;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getSubjectId() { return subjectId; }
        public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public int getOrderIndex() { return orderIndex; }
        public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }

        public List<TopicSummary> getTopics() { return topics; }
        public void setTopics(List<TopicSummary> topics) { this.topics = topics; }
    }

    public static class TopicSummary {
        private Long id;
        private Long moduleId;
        private String title;
        private String description;
        private int orderIndex;
        private boolean completed;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getModuleId() { return moduleId; }
        public void setModuleId(Long moduleId) { this.moduleId = moduleId; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public int getOrderIndex() { return orderIndex; }
        public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }

        public boolean isCompleted() { return completed; }
        public void setCompleted(boolean completed) { this.completed = completed; }

        private boolean hasVideo;
        private boolean hasMaterial;
        private int durationMinutes = 30;
        private String videoUrl;

        public boolean isHasVideo() { return hasVideo; }
        public void setHasVideo(boolean hasVideo) { this.hasVideo = hasVideo; }

        public boolean isHasMaterial() { return hasMaterial; }
        public void setHasMaterial(boolean hasMaterial) { this.hasMaterial = hasMaterial; }

        public int getDurationMinutes() { return durationMinutes; }
        public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }

        public String getVideoUrl() { return videoUrl; }
        public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }
    }

    public static class TopicDetail {
        private Long id;
        private Long moduleId;
        private String title;
        private String description;
        private List<LearningItemDetail> items;
        private List<VideoSummary> videos;
        private List<MaterialSummary> materials;
        private boolean completed;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getModuleId() { return moduleId; }
        public void setModuleId(Long moduleId) { this.moduleId = moduleId; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public List<LearningItemDetail> getItems() { return items; }
        public void setItems(List<LearningItemDetail> items) { this.items = items; }

        public List<VideoSummary> getVideos() { return videos; }
        public void setVideos(List<VideoSummary> videos) { this.videos = videos; }

        public List<MaterialSummary> getMaterials() { return materials; }
        public void setMaterials(List<MaterialSummary> materials) { this.materials = materials; }

        public boolean isCompleted() { return completed; }
        public void setCompleted(boolean completed) { this.completed = completed; }
    }

    public static class LearningItemDetail {
        private Long id;
        private Long topicId;
        private String title;
        private String itemType;
        private String content;
        private int orderIndex;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getTopicId() { return topicId; }
        public void setTopicId(Long topicId) { this.topicId = topicId; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getItemType() { return itemType; }
        public void setItemType(String itemType) { this.itemType = itemType; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }

        public int getOrderIndex() { return orderIndex; }
        public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }
    }

    public static class VideoSummary {
        private Long id;
        private String title;
        private String description;
        private String videoUrl;
        private String thumbnailUrl;
        private int durationSeconds;
        private int lastPositionSeconds;
        private double watchedPercentage;
        private boolean completed;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

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
    }

    public static class MaterialSummary {
        private Long id;
        private String title;
        private String description;
        private String materialType;
        private String fileUrl;
        private long fileSizeBytes;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getMaterialType() { return materialType; }
        public void setMaterialType(String materialType) { this.materialType = materialType; }

        public String getFileUrl() { return fileUrl; }
        public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

        public long getFileSizeBytes() { return fileSizeBytes; }
        public void setFileSizeBytes(long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; }
    }

    public static class CreateCourseRequest {
        @NotBlank(message = "Title is required")
        private String title;

        @NotBlank(message = "Slug is required")
        private String slug;

        private String description;
        private String thumbnailUrl;
        private int orderIndex;
        private boolean published = true;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getSlug() { return slug; }
        public void setSlug(String slug) { this.slug = slug; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getThumbnailUrl() { return thumbnailUrl; }
        public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

        public int getOrderIndex() { return orderIndex; }
        public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }

        public boolean isPublished() { return published; }
        public void setPublished(boolean published) { this.published = published; }
    }
}

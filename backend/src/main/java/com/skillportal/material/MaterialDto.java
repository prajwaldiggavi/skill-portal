package com.skillportal.material;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class MaterialDto {

    public static class MaterialItem {
        private Long id;
        private Long topicId;
        private Long subjectId;
        private String title;
        private String description;
        private String materialType;
        private String fileUrl;
        private long fileSizeBytes;
        private boolean bookmarked;
        private String subjectTitle;
        private String topicTitle;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getTopicId() { return topicId; }
        public void setTopicId(Long topicId) { this.topicId = topicId; }

        public Long getSubjectId() { return subjectId; }
        public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

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

        public boolean isBookmarked() { return bookmarked; }
        public void setBookmarked(boolean bookmarked) { this.bookmarked = bookmarked; }

        public String getSubjectTitle() { return subjectTitle; }
        public void setSubjectTitle(String subjectTitle) { this.subjectTitle = subjectTitle; }

        public String getTopicTitle() { return topicTitle; }
        public void setTopicTitle(String topicTitle) { this.topicTitle = topicTitle; }
    }

    public static class CreateMaterialRequest {
        private Long topicId;
        private Long subjectId;

        @NotBlank(message = "Title is required")
        private String title;

        private String description;

        @NotBlank(message = "Material type is required (PDF, DOCUMENT, DOWNLOADABLE, EXTERNAL_LINK)")
        private String materialType;

        @NotBlank(message = "File URL is required")
        private String fileUrl;

        private long fileSizeBytes;

        public Long getTopicId() { return topicId; }
        public void setTopicId(Long topicId) { this.topicId = topicId; }

        public Long getSubjectId() { return subjectId; }
        public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

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
}

package com.skillportal.bookmark;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;

    public BookmarkService(BookmarkRepository bookmarkRepository) {
        this.bookmarkRepository = bookmarkRepository;
    }

    public List<BookmarkDto.BookmarkItem> getUserBookmarks(Long userId, String typeFilter) {
        return bookmarkRepository.findByUserId(userId, typeFilter);
    }

    @Transactional
    public void addBookmark(Long userId, BookmarkDto.ToggleBookmarkRequest request) {
        bookmarkRepository.addBookmark(userId, request.getTargetType(), request.getTargetId(), request.getNotes());
    }

    @Transactional
    public void deleteBookmark(Long id, Long userId) {
        bookmarkRepository.removeBookmark(id, userId);
    }

    @Transactional
    public void deleteBookmarkByTarget(Long userId, String targetType, Long targetId) {
        bookmarkRepository.removeBookmarkByTarget(userId, targetType, targetId);
    }
}

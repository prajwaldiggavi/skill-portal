package com.skillportal.question;

import com.skillportal.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;

    public QuestionService(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    public QuestionDto.QuestionDetail getQuestionById(Long id, Long userId) {
        return questionRepository.findQuestionById(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + id));
    }

    @Transactional
    public QuestionDto.AttemptResult submitMcqAttempt(Long userId, Long questionId, QuestionDto.SubmitMcqAttemptRequest request) {
        return questionRepository.gradeMcqAttempt(userId, questionId, request);
    }
}

package com.skillportal.test;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TestService {

    private final TestRepository testRepository;

    public TestService(TestRepository testRepository) {
        this.testRepository = testRepository;
    }

    public List<TestDto.TestSummary> getAllTests(Long userId) {
        return testRepository.findAllTests(userId);
    }

    @Transactional
    public TestDto.StartTestResponse startOrResumeTest(Long userId, Long testId) {
        return testRepository.startOrResumeTest(userId, testId);
    }

    @Transactional
    public void saveAnswer(Long userId, TestDto.SaveAnswerRequest request) {
        testRepository.saveAnswer(userId, request);
    }

    @Transactional
    public TestDto.TestResultSummary submitTest(Long userId, Long attemptId) {
        return testRepository.submitAttempt(userId, attemptId, false);
    }

    public TestDto.TestResultSummary getResult(Long userId, Long attemptId) {
        return testRepository.getResultSummary(userId, attemptId);
    }
}

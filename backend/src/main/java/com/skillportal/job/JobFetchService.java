package com.skillportal.job;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Backward compatibility facade for JobFetchService.
 * Delegates to JobAggregationService for multi-source coordination.
 */
@Service
public class JobFetchService {

    private static final Logger log = LoggerFactory.getLogger(JobFetchService.class);

    private final JobAggregationService jobAggregationService;

    public JobFetchService(JobAggregationService jobAggregationService) {
        this.jobAggregationService = jobAggregationService;
    }

    /**
     * Backward-compatible method to fetch and save jobs
     */
    public int fetchAndSaveJobs() {
        log.info("JobFetchService.fetchAndSaveJobs called -> delegating to JobAggregationService");
        return jobAggregationService.aggregateAllSources();
    }
}

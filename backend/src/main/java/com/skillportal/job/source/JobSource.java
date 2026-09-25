package com.skillportal.job.source;

import java.util.List;

public interface JobSource {

    /**
     * Human-readable name of the job source provider
     */
    String getSourceName();

    /**
     * Discover live / verified job postings from this source
     */
    List<DiscoveredJob> discoverJobs();
}

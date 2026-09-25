package com.skillportal.job.careerhub;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CareerSourceRepository extends JpaRepository<CareerSource, Long> {

    Optional<CareerSource> findByCompanyNameIgnoreCase(String companyName);

    boolean existsByCompanyNameIgnoreCase(String companyName);

    List<CareerSource> findAllByOrderByMatchingJobsCountDesc();
}

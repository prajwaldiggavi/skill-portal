package com.skillportal.job;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentJobPreferenceRepository extends JpaRepository<StudentJobPreference, Long> {

    Optional<StudentJobPreference> findByUserId(Long userId);
}

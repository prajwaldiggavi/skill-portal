-- SKILL PORTAL Demo Seed Data V2
-- Educational demo data with realistic courses, questions, and accounts

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Roles
INSERT INTO roles (id, name, description) VALUES
(1, 'ROLE_ADMIN', 'Platform Administrator with full access to manage courses, batches, and assessments'),
(2, 'ROLE_STUDENT', 'Enrolled Student with access to learn, practice coding, and take assessments')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Batches
INSERT INTO batches (id, name, code, description, start_date, end_date, is_active) VALUES
(1, 'Java Full Stack Morning Batch 2026', 'JFS-2026-A1', 'Intensive Full Stack Java development batch covering Java 21, Spring Boot, and React', '2026-01-15', '2026-07-15', TRUE),
(2, 'Data Structures & Algorithms Weekend Batch', 'DSA-2026-W1', 'Advanced problem solving, algorithmic patterns, and interview preparation', '2026-02-01', '2026-08-01', TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Users
-- Passwords:
-- Admin: Admin@123   -> $2a$10$bfOBBwzLAOWYzTjrbz1lWeTd9wNLJjFgVaksaU1dscj7FI/pzkb2S
-- Students: Student@123 -> $2a$10$Y1/hTslhNyi.WaXfVykPTebGJVT2XIlJ6xxhsThJiT3ulKzaszwdq
INSERT INTO users (id, email, password_hash, full_name, role, status, failed_login_attempts) VALUES
(1, 'admin@skillportal.com', '$2a$10$bfOBBwzLAOWYzTjrbz1lWeTd9wNLJjFgVaksaU1dscj7FI/pzkb2S', 'System Administrator', 'ROLE_ADMIN', 'ACTIVE', 0),
(2, 'student@skillportal.com', '$2a$10$Y1/hTslhNyi.WaXfVykPTebGJVT2XIlJ6xxhsThJiT3ulKzaszwdq', 'Shiva Kumar', 'ROLE_STUDENT', 'ACTIVE', 0),
(3, 'rahul.k@skillportal.com', '$2a$10$Y1/hTslhNyi.WaXfVykPTebGJVT2XIlJ6xxhsThJiT3ulKzaszwdq', 'Rahul Sharma', 'ROLE_STUDENT', 'ACTIVE', 0),
(4, 'priya.s@skillportal.com', '$2a$10$Y1/hTslhNyi.WaXfVykPTebGJVT2XIlJ6xxhsThJiT3ulKzaszwdq', 'Priya Sundaram', 'ROLE_STUDENT', 'ACTIVE', 0),
(5, 'ananya.r@skillportal.com', '$2a$10$Y1/hTslhNyi.WaXfVykPTebGJVT2XIlJ6xxhsThJiT3ulKzaszwdq', 'Ananya Rao', 'ROLE_STUDENT', 'ACTIVE', 0)
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- Students Profiles
INSERT INTO students (id, user_id, student_id_number, phone, batch_id, avatar_url, github_url, linkedin_url, portfolio_url, skills, bio, total_points) VALUES
(1, 2, 'STU-2026-001', '+91 9876543210', 1, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'https://github.com/shivakumar', 'https://linkedin.com/in/shivakumar', 'https://shivakumar.dev', 'Java, Spring Boot, MySQL, React, TypeScript', 'Passionate Java full-stack developer in training.', 480),
(2, 3, 'STU-2026-002', '+91 9876543211', 1, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'https://github.com/rahulsharma', 'https://linkedin.com/in/rahulsharma', '', 'Java, DSA, Algorithms, Python', 'Competitive coder and problem solver.', 560),
(3, 4, 'STU-2026-003', '+91 9876543212', 1, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'https://github.com/priyasundaram', 'https://linkedin.com/in/priyasundaram', '', 'React, Node.js, Java, Spring Boot', 'Full-stack engineering enthusiast.', 420),
(4, 5, 'STU-2026-004', '+91 9876543213', 2, 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', 'https://github.com/ananyarao', 'https://linkedin.com/in/ananyarao', '', 'Data Structures, Java, C++', 'DSA enthusiast aiming for tier-1 tech placements.', 390)
ON DUPLICATE KEY UPDATE student_id_number=VALUES(student_id_number);

-- Courses
INSERT INTO courses (id, title, slug, description, thumbnail_url, order_index, is_published) VALUES
(1, 'Mastering Java Full Stack Engineering', 'java-full-stack', 'Complete end-to-end career track covering Java 21, Spring Boot 3, REST APIs, MySQL, and React TypeScript frontend architectures.', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600', 1, TRUE),
(2, 'Data Structures & Algorithmic Problem Solving', 'dsa-java', 'Master interview-ready algorithms, array sliding window, two-pointer techniques, trees, graphs, and dynamic programming in Java.', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600', 2, TRUE)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Enrollments
INSERT INTO enrollments (id, student_id, course_id, enrolled_at, status) VALUES
(1, 1, 1, '2026-01-20 09:00:00', 'ACTIVE'),
(2, 1, 2, '2026-02-05 10:30:00', 'ACTIVE'),
(3, 2, 1, '2026-01-20 09:00:00', 'ACTIVE'),
(4, 3, 1, '2026-01-21 11:00:00', 'ACTIVE')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- Subjects for Course 1
INSERT INTO subjects (id, course_id, title, description, order_index, is_published) VALUES
(1, 1, 'Core Java Foundations', 'In-depth Java syntax, JVM internals, memory allocation, and collections framework.', 1, TRUE),
(2, 1, 'Relational Databases & JDBC', 'Database normalization, indexing, transactions, and explicit Java JDBC connectivity.', 2, TRUE),
(3, 1, 'Spring Boot 3 Enterprise API Design', 'Dependency injection, Spring Security, JWT authentication, and REST microservices.', 3, TRUE),
(4, 1, 'Modern React & TypeScript', 'Building interactive single page applications, React hooks, state management, and Monaco editor.', 4, TRUE)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Modules for Subject 1 (Core Java Foundations)
INSERT INTO modules (id, subject_id, title, description, order_index, is_published) VALUES
(1, 1, 'Java Architecture & Control Structures', 'Execution pipeline of JVM, JRE, JDK, byte-code verification, loops, and conditions.', 1, TRUE),
(2, 1, 'Arrays & Algorithmic Manipulation', 'Single and multidimensional arrays, memory layout, and search/sort operations.', 2, TRUE),
(3, 1, 'Object-Oriented Programming (OOP)', 'Encapsulation, inheritance, polymorphism, abstract classes, and interfaces.', 3, TRUE)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Topics for Module 1 & 2
INSERT INTO topics (id, module_id, title, description, order_index, is_published) VALUES
(1, 1, 'JVM Internals: ClassLoader & Memory Zones', 'Detailed inspection of Method Area, Heap, Stack, PC Registers, and Native Method Stack.', 1, TRUE),
(2, 1, 'Control Statements & Performance Considerations', 'Branching with switch expressions, loop unrolling, and recursion bounds.', 2, TRUE),
(3, 2, 'Array Traversals & Subarray Math', 'Two pointers, sliding window, and prime sum subarray verification.', 1, TRUE),
(4, 3, 'Interfaces & Default Methods in Modern Java', 'Contract-driven design, functional interfaces, and method references.', 1, TRUE)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Learning Items (Lessons)
INSERT INTO learning_items (id, topic_id, title, item_type, content, order_index, is_published) VALUES
(1, 1, 'Understanding JVM Memory Layout', 'TEXT', '# JVM Architecture & Memory Management\n\nThe Java Virtual Machine (JVM) executes Java bytecode. When a program starts, the JVM loads classes via the **ClassLoader subsystem**...\n\n### Key Components:\n- **Heap**: Stores all objects and instance variables.\n- **Stack**: Stores method frames and local primitives.\n- **Method Area**: Stores class metadata, bytecode, and static fields.', 1, TRUE),
(2, 3, 'Prime Subarray Discovery Techniques', 'TEXT', '# Finding Subarrays with Prime Sums\n\nA subarray is a contiguous part of an array. To determine if the sum of elements in a subarray is prime, we evaluate:\n\n$$\\text{sum}(i, j) = \\sum_{k=i}^{j} a[k]$$\n\nIf $\\text{sum} \\ge 2$ and has no divisors other than 1 and itself, the subarray is prime.', 1, TRUE)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Recorded Classes (Videos)
INSERT INTO recorded_classes (id, topic_id, title, description, video_url, thumbnail_url, duration_seconds, order_index, is_published) VALUES
(1, 1, 'Lecture 01: JVM Internal Architecture & Execution Engine', 'Comprehensive classroom walkthrough explaining class loading phases and memory segmentation.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300', 3600, 1, TRUE),
(2, 2, 'Lecture 02: Loops, Branching & Compiler Optimizations', 'Deep dive into JIT compiler optimizations, loop unrolling, and branch prediction.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300', 3120, 2, TRUE),
(3, 3, 'Lecture 03: Arrays, Memory Representation & Subarray Algorithms', 'Step-by-step coding tutorial demonstrating subarray generation and prime sum checking.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300', 4200, 3, TRUE)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Pre-seed Video Progress for Student (User ID 2)
INSERT INTO video_progress (id, user_id, video_id, last_position_seconds, watched_percentage, is_completed, completed_at) VALUES
(1, 2, 1, 3600, 100.0, TRUE, '2026-03-01 15:45:00'),
(2, 2, 2, 3120, 100.0, TRUE, '2026-03-02 16:30:00'),
(3, 2, 3, 2730, 65.0, FALSE, NULL)
ON DUPLICATE KEY UPDATE watched_percentage=VALUES(watched_percentage);

-- Study Materials
INSERT INTO study_materials (id, topic_id, subject_id, title, description, material_type, file_url, file_size_bytes, is_published) VALUES
(1, 1, 1, 'Java 21 Foundations Master Cheatsheet.pdf', 'Complete syntax and internals quick reference guide for Java 21.', 'PDF', '/materials/java21-cheatsheet.pdf', 2450120, TRUE),
(2, 3, 1, 'Subarray Algorithms & Complexity Notes.pdf', 'Comprehensive study notes with time-complexity analysis of sliding window and two pointers.', 'PDF', '/materials/subarray-algorithms.pdf', 1840900, TRUE),
(3, NULL, 3, 'Spring Boot 3 Production Architecture Guide.pdf', 'Best practices for microservices, JWT security, and JDBC transactions.', 'PDF', '/materials/spring-boot-guide.pdf', 3120450, TRUE)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Questions (MCQs and Coding)
-- Q1: MCQ Single
INSERT INTO questions (id, title, description, explanation, question_type, difficulty, marks, topic_id, company_tag, tags, is_active, current_version) VALUES
(1, 'Array Length Property in Java', 'What is the correct way to retrieve the number of elements in a standard Java integer array `int[] arr = new int[10];`?', 'In Java, arrays are objects with a public final field `length`. They do not use a method call like `length()`, which belongs to `String`, or `size()`, which belongs to `Collection`.', 'MCQ_SINGLE', 'EASY', 5, 3, 'TCS, Infosys', 'Java, Arrays, Basics', TRUE, 1),

-- Q2: Coding Question - Prime Subarrays (From Reference!)
(2, 'Prime Subarrays', 'Print all possible subarrays whose sum is prime.\n\n### Input Format\nThe first line contains a single integer $n$, representing the number of elements in the array.\nThe second line contains $n$ space-separated integers, representing the elements of the array.\n\n### Output Format\nPrint all the possible subarrays whose sum is prime, separated by a space. If no such subarrays exist, print "None".\n\n### Constraints\n$1 \\le n \\le 20$\n$-100 \\le \\text{elements of the array} \\le 100$', 'Generate all contiguous subarrays $(i, j)$, calculate the sum, check primality with a helper function, and print the results.', 'CODING', 'MEDIUM', 25, 3, 'Amazon, Tap Academy, Wipro', 'Arrays, Math, Subarrays', TRUE, 1),

-- Q3: MCQ Multi
(3, 'Java String Characteristics', 'Which of the following statements regarding `java.lang.String` in Java are TRUE? (Select all that apply)', 'Strings are immutable in Java. String literals are pooled in the String Constant Pool inside the Heap. StringBuilder is mutable and not thread-safe, whereas StringBuffer is synchronized.', 'MCQ_MULTI', 'MEDIUM', 10, 2, 'Accenture, Capgemini', 'Java, Strings, Memory', TRUE, 1),

-- Q4: Coding Question - Valid Palindrome
(4, 'Valid Palindrome II', 'Given a string `s`, return `true` if the `s` can be palindrome after deleting at most one character from it.\n\n### Input Format\nA single string `s` containing lowercase English letters.\n\n### Output Format\nPrint `true` or `false`.\n\n### Constraints\n$1 \\le s.length \\le 10^5$', 'Use two pointers from both ends. When a mismatch is found, check if skipping either the left or right character yields a palindrome.', 'CODING', 'EASY', 20, 3, 'Facebook, Google, Microsoft', 'Strings, Two Pointers', TRUE, 1),

-- Q5: MCQ Single
(5, 'Interface Default Methods in Java 8+', 'Can an interface in Java contain method implementations?', 'Starting with Java 8, interfaces can contain method implementations using the `default` or `static` keywords. In Java 9, private methods were also introduced.', 'MCQ_SINGLE', 'EASY', 5, 4, 'Oracle, IBM', 'Java, Interfaces, OOP', TRUE, 1),

-- Q6: Coding Question - Two Sum
(6, 'Two Sum', 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\n### Input Format\nLine 1: An integer $n$\nLine 2: $n$ space-separated integers\nLine 3: Target integer\n\n### Output Format\nTwo space-separated indices in ascending order.', 'Use a Hash map to map values to their indices for $O(n)$ time complexity.', 'CODING', 'EASY', 20, 3, 'Google, Amazon, Meta', 'Arrays, Hash Table', TRUE, 1)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Question Versions
INSERT INTO question_versions (id, question_id, version_number, title, description, explanation, marks) VALUES
(1, 1, 1, 'Array Length Property in Java', 'What is the correct way to retrieve the number of elements in a standard Java integer array `int[] arr = new int[10];`?', 'In Java, arrays have a public final field `length`.', 5),
(2, 2, 1, 'Prime Subarrays', 'Print all possible subarrays whose sum is prime.', 'Contiguous subarray sum checked against primality condition.', 25),
(3, 3, 1, 'Java String Characteristics', 'Which of the following statements regarding `java.lang.String` in Java are TRUE?', 'Strings are immutable and pooled in heap.', 10),
(4, 4, 1, 'Valid Palindrome II', 'Return true if string can be palindrome after at most one deletion.', 'Two-pointer greedy check.', 20),
(5, 5, 1, 'Interface Default Methods in Java 8+', 'Can an interface in Java contain method implementations?', 'Default and static methods allow implementation.', 5),
(6, 6, 1, 'Two Sum', 'Given nums and target, find two indices.', 'Hash map lookup.', 20)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Question Options for Q1
INSERT INTO question_options (id, question_id, option_label, option_text, is_correct, order_index) VALUES
(1, 1, 'A', 'arr.length', TRUE, 1),
(2, 1, 'B', 'arr.length()', FALSE, 2),
(3, 1, 'C', 'arr.size()', FALSE, 3),
(4, 1, 'D', 'arr.count()', FALSE, 4),

-- Question Options for Q3 (Multi)
(5, 3, 'A', 'String objects in Java are immutable once created.', TRUE, 1),
(6, 3, 'B', 'String literals are stored in the String Constant Pool in heap memory.', TRUE, 2),
(7, 3, 'C', 'StringBuilder is synchronized and thread-safe.', FALSE, 3),
(8, 3, 'D', 'String class is marked as final and cannot be subclassed.', TRUE, 4),

-- Question Options for Q5
(9, 5, 'A', 'Yes, using the `default` or `static` keyword.', TRUE, 1),
(10, 5, 'B', 'No, interfaces can never contain concrete method bodies.', FALSE, 2),
(11, 5, 'C', 'Only if the interface is declared abstract.', FALSE, 3),
(12, 5, 'D', 'Only in Java 7 and earlier.', FALSE, 4)
ON DUPLICATE KEY UPDATE option_label=VALUES(option_label);

-- Coding Problem Details
INSERT INTO coding_problems (id, question_id, problem_statement, input_format, output_format, constraints, starter_code_java, starter_code_python, starter_code_js, time_limit_ms, memory_limit_mb) VALUES
(1, 2, 'Print all possible subarrays whose sum is prime.\n\nIf no such subarrays exist, print "None".',
'The first line contains a single integer n, representing the number of elements in the array.\nThe second line contains n space-separated integers, representing the elements of the array.',
'Print all the possible subarrays whose sum is prime, separated by a space. If no such subarrays exist, print "None".',
'1 <= n <= 20\n-100 <= elements of the array <= 100',
'import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) {
            a[i] = sc.nextInt();
        }
        
        boolean found = false;
        for (int i = 0; i < n; i++) {
            int sum = 0;
            for (int j = i; j < n; j++) {
                sum += a[j];
                if (isPrime(sum)) {
                    found = true;
                    for (int k = i; k <= j; k++) {
                        System.out.print(a[k] + (k == j ? "" : " "));
                    }
                    System.out.println();
                }
            }
        }
        if (!found) {
            System.out.println("None");
        }
    }

    private static boolean isPrime(int num) {
        if (num <= 1) return false;
        for (int i = 2; i * i <= num; i++) {
            if (num % i == 0) return false;
        }
        return true;
    }
}',
'def is_prime(n):
    if n <= 1:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True

n = int(input().strip())
a = list(map(int, input().split()))
found = False
for i in range(n):
    s = 0
    for j in range(i, n):
        s += a[j]
        if is_prime(s):
            found = True
            print(" ".join(map(str, a[i:j+1])))
if not found:
    print("None")',
'const fs = require("fs");
const input = fs.readFileSync(0, "utf-8").trim().split(/\s+/);
if (input.length >= 2) {
    const n = parseInt(input[0]);
    const a = input.slice(1, n + 1).map(Number);
    function isPrime(num) {
        if (num <= 1) return false;
        for (let i = 2; i * i <= num; i++) {
            if (num % i === 0) return false;
        }
        return true;
    }
    let found = false;
    for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = i; j < n; j++) {
            sum += a[j];
            if (isPrime(sum)) {
                found = true;
                console.log(a.slice(i, j + 1).join(" "));
            }
        }
    }
    if (!found) console.log("None");
}', 2000, 256),

(2, 4, 'Given a string `s`, return `true` if the `s` can be palindrome after deleting at most one character from it.',
'A single string s.', 'true or false', '1 <= s.length <= 10^5',
'import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        System.out.println(validPalindrome(s));
    }
    
    public static boolean validPalindrome(String s) {
        int l = 0, r = s.length() - 1;
        while (l < r) {
            if (s.charAt(l) != s.charAt(r)) {
                return isPal(s, l + 1, r) || isPal(s, l, r - 1);
            }
            l++;
            r--;
        }
        return true;
    }
    
    private static boolean isPal(String s, int l, int r) {
        while (l < r) {
            if (s.charAt(l++) != s.charAt(r--)) return false;
        }
        return true;
    }
}', 's = input().strip()
def is_pal(sub): return sub == sub[::-1]
l, r = 0, len(s) - 1
ans = True
while l < r:
    if s[l] != s[r]:
        ans = is_pal(s[l+1:r+1]) or is_pal(s[l:r])
        break
    l += 1
    r -= 1
print("true" if ans else "false")',
'const fs = require("fs");
const s = fs.readFileSync(0, "utf-8").trim();
function isPal(str, l, r) {
    while (l < r) if (str[l++] !== str[r--]) return false;
    return true;
}
let l = 0, r = s.length - 1, ok = true;
while (l < r) {
    if (s[l] !== s[r]) {
        ok = isPal(s, l + 1, r) || isPal(s, l, r - 1);
        break;
    }
    l++; r--;
}
console.log(ok ? "true" : "false");', 2000, 256)
ON DUPLICATE KEY UPDATE starter_code_java=VALUES(starter_code_java);

-- Test Cases for Problem 1 (Prime Subarrays - Exactly matching reference sample cases!)
INSERT INTO test_cases (id, coding_problem_id, input_data, expected_output, is_hidden, order_index) VALUES
(1, 1, '5\n1 2 3 4 5', '2\n3\n5\n1 2\n2 3\n3 4', FALSE, 1),
(2, 1, '4\n-1 -2 -3 -4', 'None', FALSE, 2),
(3, 1, '3\n2 3 5', '2\n3\n5\n2 3\n2 3 5', TRUE, 3),
(4, 1, '4\n4 6 8 9', 'None', TRUE, 4),

-- Test Cases for Problem 2 (Valid Palindrome)
(5, 2, 'aba', 'true', FALSE, 1),
(6, 2, 'abca', 'true', FALSE, 2),
(7, 2, 'abc', 'false', TRUE, 3)
ON DUPLICATE KEY UPDATE input_data=VALUES(input_data);

-- Assignments
INSERT INTO assignments (id, title, description, difficulty, total_marks, time_limit_minutes, is_published) VALUES
(1, 'Foundational Java Programming Lab 01', 'Master fundamental loops, array memory layout, and prime subarray discovery algorithms.', 'MEDIUM', 100, 120, TRUE),
(2, 'Object-Oriented Design & Problem Solving', 'Deep dive into encapsulation, abstract classes, interfaces, and palindrome checking.', 'HARD', 100, 180, TRUE)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Assignment Sections (Sequential Locking Architecture)
INSERT INTO assignment_sections (id, assignment_id, section_number, title, description, order_index) VALUES
(1, 1, 1, 'Section 1: Array Mechanics & Fundamentals', 'Core questions on array indexing and prime subarray generation.', 1),
(2, 1, 2, 'Section 2: String Algorithms & Palindromes', 'Advanced manipulation of Strings and two-pointer techniques.', 2),
(3, 1, 3, 'Section 3: Object-Oriented Principles', 'Interface default methods and contract-based design.', 3)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Link Questions to Assignment Sections
INSERT INTO assignment_questions (id, section_id, question_id, order_index) VALUES
(1, 1, 1, 1), -- MCQ Single: Array length
(2, 1, 2, 2), -- Coding: Prime Subarrays
(3, 2, 3, 1), -- MCQ Multi: Strings
(4, 2, 4, 2), -- Coding: Valid Palindrome
(5, 3, 5, 1), -- MCQ Single: Interface Default Methods
(6, 3, 6, 2)  -- Coding: Two Sum
ON DUPLICATE KEY UPDATE question_id=VALUES(question_id);

-- Tests
INSERT INTO tests (id, title, description, duration_minutes, total_marks, passing_percentage, is_published) VALUES
(1, 'Java Full Stack Mid-Term Assessment 2026', 'Comprehensive timed assessment testing Java language fundamentals, array math, and OOP.', 30, 40, 50, TRUE)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Test Sections
INSERT INTO test_sections (id, test_id, title, order_index) VALUES
(1, 1, 'Section A: Multiple Choice Questions', 1),
(2, 1, 'Section B: Algorithmic Coding Challenge', 2)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Test Questions
INSERT INTO test_questions (id, test_section_id, question_id, question_version_id, marks, order_index) VALUES
(1, 1, 1, 1, 5, 1),
(2, 1, 3, 1, 10, 2),
(3, 2, 2, 1, 25, 1)
ON DUPLICATE KEY UPDATE marks=VALUES(marks);

-- Attendance Sessions
INSERT INTO attendance_sessions (id, batch_id, subject_id, title, session_date, start_time, end_time, created_by) VALUES
(1, 1, 1, 'Core Java: JVM Architecture & Bytecode', '2026-03-10', '09:00:00', '11:00:00', 1),
(2, 1, 1, 'Core Java: Array Traversals & Prime Math', '2026-03-12', '09:00:00', '11:00:00', 1),
(3, 1, 1, 'Core Java: OOP Principles & Polymorphism', '2026-03-14', '09:00:00', '11:00:00', 1)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Attendance Records for Student 1 (Shiva Kumar)
INSERT INTO attendance_records (id, session_id, student_id, status, remarks) VALUES
(1, 1, 1, 'PRESENT', 'Attended lecture and answered live poll'),
(2, 2, 1, 'PRESENT', 'Active participation in code walk'),
(3, 3, 1, 'PRESENT', 'On time')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- Notifications
INSERT INTO notifications (id, user_id, title, message, type, link_url, is_read) VALUES
(1, 2, 'Welcome to SKILL PORTAL', 'Explore your Java Full Stack learning track, solve coding problems, and track your streaks.', 'SYSTEM', '/dashboard', FALSE),
(2, 2, 'New Assignment Released', 'Foundational Java Programming Lab 01 is now open for submissions.', 'ASSIGNMENT', '/assignments/1', FALSE),
(3, 2, 'Scheduled Assessment Notice', 'Java Full Stack Mid-Term Assessment 2026 is scheduled this week. Test timer is server-authoritative.', 'TEST', '/tests/1', TRUE)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Bookmarks for Student 1
INSERT INTO bookmarks (id, user_id, target_type, target_id, notes) VALUES
(1, 2, 'QUESTION', 2, 'Review prime subarray sliding window logic before placement drive.'),
(2, 2, 'MATERIAL', 1, 'Java 21 Cheatsheet for quick revision.')
ON DUPLICATE KEY UPDATE notes=VALUES(notes);

-- Progress Events (For Activity Heatmap & Streaks)
INSERT INTO progress_events (user_id, event_type, reference_id, details, created_at) VALUES
(2, 'VIDEO_COMPLETED', 1, 'Watched JVM Architecture Lecture', '2026-03-01 15:45:00'),
(2, 'VIDEO_COMPLETED', 2, 'Watched Loops & Compiler Optimizations', '2026-03-02 16:30:00'),
(2, 'QUESTION_SOLVED', 1, 'Solved Array Length MCQ', '2026-03-05 11:20:00'),
(2, 'QUESTION_SOLVED', 2, 'Accepted Prime Subarrays Java Solution', '2026-03-08 17:15:00'),
(2, 'QUESTION_SOLVED', 4, 'Accepted Valid Palindrome II Python Solution', '2026-03-12 14:00:00'),
(2, 'QUESTION_SOLVED', 6, 'Accepted Two Sum Java Solution', '2026-03-18 19:30:00'),
(2, 'TOPIC_COMPLETED', 1, 'Finished JVM Internals Topic', '2026-03-19 10:00:00'),
(2, 'ASSIGNMENT_SECTION_COMPLETED', 1, 'Completed Section 1 with 100% score', '2026-03-20 18:40:00')
ON DUPLICATE KEY UPDATE details=VALUES(details);

-- Settings
INSERT INTO settings (setting_key, setting_value, description) VALUES
('PLATFORM_NAME', 'SKILL PORTAL', 'Platform Application Name'),
('ANNOUNCEMENT_BANNER', '🚀 Welcome to SKILL PORTAL! Java 21 Full Stack + Spring Boot 3 + Monaco Coding Sandbox is live.', 'Top marquee announcement banner message'),
('ALLOW_REGISTRATION', 'false', 'Whether self-service registration is allowed')
ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value);

SET FOREIGN_KEY_CHECKS = 1;
